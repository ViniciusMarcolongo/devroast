import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border-subtle bg-app-bg">
      <div className="flex w-full items-center justify-between gap-6 px-6 py-4 md:px-10">
        <Link
          className="inline-flex items-center gap-2 font-mono-ui text-[13px] text-text-primary"
          href="/"
        >
          <span className="text-accent-green">&gt;</span>
          <span>devroast</span>
        </Link>

        <nav>
          <Link
            className="font-mono-ui text-[11px] text-text-secondary transition-colors hover:text-text-primary"
            href="/leaderboard"
          >
            leaderboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
