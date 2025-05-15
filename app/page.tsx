import { Suspense } from "react"
import Link from "next/link"
import { FileUpload } from "@/components/file-upload"
import { SampleDataButton } from "@/components/sample-data-button"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Clock, History, Youtube } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader activePath="/" />

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Discover Your YouTube Watching Habits
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload your YouTube watch history from Google Takeout and
                    get detailed insights about your viewing habits.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="#upload-section">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <History className="h-4 w-4" />
                    <span>View your watch patterns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Track time spent watching</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4" />
                    <span>Visualize your interests</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] overflow-hidden rounded-lg border bg-background p-2 shadow-xl">
                  <img
                    src="/screenshot.png?height=500&width=500"
                    alt="Dashboard preview"
                    className="aspect-square w-full rounded-md object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="upload-section"
          className="w-full border-t py-12 md:py-24 lg:py-32 bg-muted/40"
        >
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[800px] flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Upload Your Watch History
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Get started by uploading your watch-history.json file from
                  Google Takeout
                </p>
              </div>
              <div className="w-full max-w-md">
                <Suspense fallback={<DashboardSkeleton />}>
                  <FileUpload />
                </Suspense>
              </div>

              <div className="w-full max-w-md flex items-center gap-4 my-4">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">OR</span>
                <Separator className="flex-1" />
              </div>

              <div className="w-full max-w-md">
                <SampleDataButton />
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p>Don&apos;t have your data yet?</p>
                <Link
                  href="https://takeout.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Download your data from Google Takeout
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  How it works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Analyze Your YouTube Data
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Our app processes your watch history and connects to
                  YouTube&apos;s API to provide comprehensive insights.
                </p>
              </div>
              <div className="grid gap-6">
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Upload your watch history</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload the watch-history.json file from your Google
                      Takeout data.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Connect with YouTube</h3>
                    <p className="text-sm text-muted-foreground">
                      Authorize access to YouTube Data API to fetch additional
                      video metadata.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">View your insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Explore detailed analytics about your viewing habits and
                      preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
