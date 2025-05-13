import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with Next.js and YouTube Data API. Your data never leaves your browser.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">
            Terms
          </Link>
          <Link href="/about" className="underline underline-offset-4 hover:text-foreground">
            About
          </Link>
        </div>
      </div>
    </footer>
  )
}
