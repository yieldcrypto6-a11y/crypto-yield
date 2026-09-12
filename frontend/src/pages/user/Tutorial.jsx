import React from "react";
import { FiInfo, FiPlayCircle } from "react-icons/fi";

const YOUTUBE_VIDEO_ID = "dcBocJAdQks";

export default function Tutorial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">
          Getting Started Tutorial
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Watch a walkthrough of how deposits, packages and payouts work.
        </p>
      </div>

      <div className="neon-border neon-border-violet rounded-2xl p-2 bg-white/[0.02]">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
            title="CryptoGrow Getting Started Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-400 bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <FiInfo className="shrink-0 mt-0.5 text-cyan-300" />

        <span>
          This tutorial explains how deposits, packages and payouts work on
          the platform.
        </span>
      </div>
    </div>
  );
}