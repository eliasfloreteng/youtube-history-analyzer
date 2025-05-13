import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YouTube History Analyzer | Discover Your Watching Habits",
  description:
    "Upload your YouTube watch history and get detailed insights about your viewing habits and preferences. Privacy-focused analysis that never leaves your browser.",
  keywords: ["YouTube", "watch history", "analytics", "data visualization", "viewing habits", "privacy"],
  authors: [{ name: "YouTube History Analyzer" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "YouTube History Analyzer | Discover Your Watching Habits",
    description:
      "Upload your YouTube watch history and get detailed insights about your viewing habits and preferences.",
    siteName: "YouTube History Analyzer",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube History Analyzer | Discover Your Watching Habits",
    description:
      "Upload your YouTube watch history and get detailed insights about your viewing habits and preferences.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
