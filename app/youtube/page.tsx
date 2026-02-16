"use client";

import Link from "next/link";
import { YOUTUBE_VIDEOS } from "../youtube-data";

export default function YouTubePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            ためになるミリネYouTube
          </h1>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:underline"
          >
            クイズに戻る
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {YOUTUBE_VIDEOS.map((video, i) => (
            <a
              key={i}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center min-h-[100px] p-4 bg-white rounded-xl shadow-md border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-lg transition-all text-center"
            >
              <span className="text-red-600 mb-2">
                <svg className="w-10 h-10 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {video.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
