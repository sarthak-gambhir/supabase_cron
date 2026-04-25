import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
);

// Keep last call time in memory (per serverless instance)
let lastCallTime: number | null = null;
const MIN_INTERVAL_MS = parseInt(
  process.env.HEARTBEAT_INTERVAL_MS || "60000",
  10,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const now = Date.now();

  // Check if last call was too recent
  if (lastCallTime && now - lastCallTime < MIN_INTERVAL_MS) {
    return res.status(400).json({
      ok: false,
      error: `Too frequent query. Please wait for ${Math.ceil((MIN_INTERVAL_MS - (now - lastCallTime)) / 1000)} seconds.`,
    });
  }

  try {
    const { data, error } = await supabase
      .from("epoch")
      .select("created_at")
      .eq("id", 1)
      .limit(1);

    if (error) {
      console.error(error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    const createdAt = data?.[0]?.created_at ?? null;

    // Update last call time only if query succeeded
    lastCallTime = now;

    return res.status(200).json({ ok: true, created_at: createdAt });
  } catch (err: unknown) {
    console.error(err);
    return res.status(500).json({ ok: false, error: (err as Error).message });
  }
}
