import React, { useState } from "react";
import { FiPlayCircle, FiInfo } from "react-icons/fi";

// The tutorial video is served directly from this backend, not YouTube/Vimeo.
// Video file lives at: backend/uploads/tutorial/tutorial.mp4
// It's reachable at this exact path because /uploads is already served
// statically by the backend (see backend/server.js). To use a different
// filename, just change VIDEO_SRC below to match.
const VIDEO_SRC = "/uploads/tutorial/tutorial.mp4";

export default function Tutorial() {
  const [missing, setMissing] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Getting Started Tutorial</h1>
        <p className="text-slate-400 text-sm mt-1">Watch a walkthrough of how deposits, packages and payouts work.</p>
      </div>

      <div className="neon-border neon-border-violet rounded-2xl p-2 bg-white/[0.02]">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-2 grid place-items-center">
          {!missing ? (
            <video
              key={VIDEO_SRC}
              src={VIDEO_SRC}
              controls
              playsInline
              className="w-full h-full absolute inset-0 object-contain bg-black"
              onError={() => setMissing(true)}
            />
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-3 text-slate-500 px-6 text-center">
              <FiPlayCircle size={48} />
              <p className="text-sm">
                Tutorial video not found. Upload it to <code className="text-slate-400">backend/uploads/tutorial/tutorial.mp4</code> on the server.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-400 bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <FiInfo className="shrink-0 mt-0.5 text-cyan-300" />
        This video is hosted directly on this platform's own server (not YouTube) and explains how to
        choose a package, send a crypto deposit, upload proof of payment, and track your daily earnings.
      </div>
    </div>
  );
}
