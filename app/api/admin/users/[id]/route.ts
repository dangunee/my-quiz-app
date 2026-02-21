import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminSecret = process.env.ADMIN_SECRET!;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const key = auth?.replace("Bearer ", "");
  if (!adminSecret || key !== adminSecret) {
    return null;
  }
  return true;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) return unauthorized();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const {
    email,
    name,
    username,
    region,
    plan_type,
    course_type,
    payment_status,
    period,
    interval,
    start_date,
    writing_approved,
  } = body;

  if (!id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const authUpdates: { email?: string; user_metadata?: Record<string, string> } = {};

    if (typeof email === "string") authUpdates.email = email;
    if (typeof name === "string" || typeof username === "string") {
      authUpdates.user_metadata = {};
      if (typeof name === "string") authUpdates.user_metadata.name = name;
      if (typeof username === "string") authUpdates.user_metadata.username = username;
    }

    const profileFields: Record<string, unknown> = {};
    if (region !== undefined) profileFields.region = region === "" ? null : region;
    if (plan_type !== undefined) profileFields.plan_type = plan_type === "" ? null : plan_type;
    if (course_type !== undefined) profileFields.course_type = course_type === "" ? null : course_type;
    if (payment_status !== undefined) profileFields.payment_status = payment_status === "" ? null : payment_status;
    if (period !== undefined) profileFields.period = period === "" || period == null ? null : Number(period);
    if (interval !== undefined) profileFields.course_interval = interval === "" ? null : interval;
    if (start_date !== undefined) profileFields.start_date = start_date === "" ? null : start_date;
    if (writing_approved !== undefined) profileFields.writing_approved = !!writing_approved;

    if (Object.keys(authUpdates).length === 0 && Object.keys(profileFields).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error } = await supabase.auth.admin.updateUserById(id, authUpdates);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    if (Object.keys(profileFields).length > 0) {
      profileFields.updated_at = new Date().toISOString();
      const { error: upsertError } = await supabase
        .from("customer_profiles")
        .upsert(
          { user_id: id, ...profileFields },
          { onConflict: "user_id" }
        );
      if (upsertError) {
        return NextResponse.json({ error: upsertError.message }, { status: 400 });
      }
    }

    const { data: userData } = await supabase.auth.admin.getUserById(id);
    const { data: profileData } = await supabase
      .from("customer_profiles")
      .select("*")
      .eq("user_id", id)
      .single();

    const p = profileData;
    return NextResponse.json({
      success: true,
      user: {
        id: userData?.user?.id,
        email: userData?.user?.email,
        name: userData?.user?.user_metadata?.name,
        username: userData?.user?.user_metadata?.username,
        lastSignInAt: userData?.user?.last_sign_in_at,
        region: p?.region ?? null,
        plan_type: p?.plan_type ?? null,
        course_type: p?.course_type ?? null,
        payment_status: p?.payment_status ?? null,
        period: p?.period ?? null,
        interval: p?.course_interval ?? null,
        start_date: p?.start_date ?? null,
        writing_approved: p?.writing_approved ?? false,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) return unauthorized();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
