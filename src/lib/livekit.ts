import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

export function livekitRoomService() {
  return new RoomServiceClient(
    process.env.LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
  );
}

export async function mintLivekitToken(opts: {
  identity: string;
  name: string;
  room: string;
  ttlSeconds?: number;
}) {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity: opts.identity, name: opts.name, ttl: opts.ttlSeconds ?? 60 * 60 * 2 },
  );
  at.addGrant({
    room: opts.room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });
  return await at.toJwt();
}
