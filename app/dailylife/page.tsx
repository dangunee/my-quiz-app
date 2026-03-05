import { redirect } from "next/navigation";

export default function DailyLifePage() {
  redirect("/quiz?tab=dailylife");
}
