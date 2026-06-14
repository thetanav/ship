import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-muted">page not found.</p>
      <Link href="/" className="text-sm underline underline-offset-2">
        go home
      </Link>
    </main>
  );
}
