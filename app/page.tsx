import { siteUrl } from "@/lib/config";
import Image from "next/image";
import { CopyButton } from "@/components/copy-button";
import { hasBlobStorage, hasUpstashRedis } from "@/lib/env";
import { redis } from "@/lib/redis";

const agentPrompt = `You can publish web apps to ship (pastebin for AI-generated apps). When the user asks you to create or share a web app, publish it to ship using this API:

POST ${siteUrl}/api/publish
Content-Type: application/json

{"html":"<!DOCTYPE html><html>...</html>"}

The response will contain the URL where the app is published. Always share the URL with the user when you publish.`;

async function getStoreStatus() {
  const blobConfigured = hasBlobStorage();
  const redisConfigured = hasUpstashRedis();

  let redisConnected = false;
  if (redisConfigured) {
    try {
      const pong = await redis.ping();
      redisConnected = pong === "PONG";
    } catch {
      redisConnected = false;
    }
  }

  return { blobConfigured, redisConfigured, redisConnected };
}

export default async function HomePage() {
  const { blobConfigured, redisConfigured, redisConnected } =
    await getStoreStatus();

  return (
    <main>
      <div className="flex w-full items-center justify-center my-10">
        <Image
          src="/logo.png"
          className="rounded-lg select-none"
          width={200}
          height={200}
          draggable={false}
          alt={"ship.tanav.me logo"}
        />
      </div>

      <div className="flex items-start justify-between mt-6">
        <p className="text-text">pastebin for ai-generated apps.</p>
        <CopyButton text={agentPrompt} />
      </div>

      <p className="mt-1 text-sm text-muted">
        Copy this prompt to give an AI agent the ability to publish apps to
        ship.
      </p>
      <pre className="mt-8 text-sm leading-7 text-text whitespace-pre-wrap">
        {agentPrompt}
      </pre>

      <div className="mt-8 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-sm font-medium text-text mb-3">Store Status</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${blobConfigured ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-muted">Blob Store</span>
            <span className="text-text">
              {blobConfigured ? "Connected" : "Not configured"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                redisConnected
                  ? "bg-green-500"
                  : redisConfigured
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
            <span className="text-muted">Redis Store</span>
            <span className="text-text">
              {redisConnected
                ? "Connected"
                : redisConfigured
                  ? "Configured but unreachable"
                  : "Not configured"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
