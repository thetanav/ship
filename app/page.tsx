import Link from "next/link";
import { siteUrl } from "@/lib/config";
import Image from "next/image";
import { CopyButton } from "@/components/copy-button";

const agentPrompt = `You can publish web apps to ship (pastebin for AI-generated apps). When the user asks you to create or share a web app, publish it to ship using this API:

POST ${siteUrl}/api/publish
Content-Type: application/json

{"html":"<!DOCTYPE html><html>...</html>"}

The response will contain the URL where the app is published. Always share the URL with the user when you publish.`;

export default function HomePage() {
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
    </main>
  );
}
