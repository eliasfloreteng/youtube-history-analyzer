import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Youtube } from "lucide-react"

interface SiteHeaderProps {
  activePath?: string
}

export function SiteHeader({ activePath = "" }: SiteHeaderProps) {
  // Navigation items in consistent order
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/about", label: "About" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Youtube className="h-5 w-5 text-red-600" />
          <span>YouTube History Analyzer</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={activePath === item.href ? "default" : "ghost"}
                size="sm"
                className={activePath === item.href ? "pointer-events-none" : ""}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
