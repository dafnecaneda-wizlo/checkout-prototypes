import { NextResponse } from "next/server";
import { Gr4vy, withToken, getEmbedToken } from "@gr4vy/sdk";

export const runtime = "nodejs";

interface Body {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  buyerExternalIdentifier?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { amount, currency = "USD", metadata, buyerExternalIdentifier } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: "amount (positive integer cents) is required" },
      { status: 400 },
    );
  }

  const rawKey = process.env.GR4VY_PRIVATE_KEY;
  const serverId = process.env.GR4VY_SERVER_ID;
  const server = process.env.GR4VY_SERVER as "sandbox" | "production" | undefined;
  const merchantAccountId =
    process.env.GR4VY_MERCHANT_ACCOUNT_ID || "default";

  if (!rawKey || !serverId || !server) {
    return NextResponse.json(
      {
        error:
          "Server env missing GR4VY_PRIVATE_KEY / GR4VY_SERVER_ID / GR4VY_SERVER",
      },
      { status: 500 },
    );
  }

  const privateKey = Buffer.from(rawKey, "base64").toString("utf8");

  try {
    const client = new Gr4vy({
      server,
      id: serverId,
      bearerAuth: withToken({ privateKey }),
    });

    const session = await client.checkoutSessions.create(
      { expiresIn: 3600 },
      merchantAccountId,
    );

    const token = await getEmbedToken({
      privateKey,
      checkoutSessionId: session.id,
      embedParams: {
        amount,
        currency,
        buyerExternalIdentifier,
        metadata,
      },
    });

    return NextResponse.json({ checkoutSessionId: session.id, token });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: `Gr4vy session mint failed: ${message}` },
      { status: 502 },
    );
  }
}
