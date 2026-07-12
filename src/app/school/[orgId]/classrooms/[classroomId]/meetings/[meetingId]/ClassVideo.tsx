"use client";
import { useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

// Zoom-like classroom: any classroom member can join the meeting's video
// room. The token is minted server-side (membership-gated) and handed in.
export function ClassVideo({
  livekitUrl, token, title,
}: { livekitUrl: string; token: string; title: string }) {
  const [joined, setJoined] = useState(false);

  if (!joined) {
    return (
      <button onClick={() => setJoined(true)} className="btn-primary w-full">
        🎥 Join class video
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10" style={{ height: "70vh" }}>
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect
        video
        audio
        onDisconnected={() => setJoined(false)}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
      <p className="sr-only">{title}</p>
    </div>
  );
}
