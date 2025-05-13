import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, FileJson, Lock, Youtube } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader activePath="/about" />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                About YouTube History Analyzer
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Discover insights about your YouTube watching habits with our privacy-focused analysis tool.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <FileJson className="h-12 w-12 text-primary" />
                  <CardTitle className="mt-2">Your Data, Your Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Upload your watch history from Google Takeout and get detailed analytics about your viewing habits.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Lock className="h-12 w-12 text-primary" />
                  <CardTitle className="mt-2">Privacy First</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    All processing happens in your browser. Your data never leaves your device or gets stored on our
                    servers.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Youtube className="h-12 w-12 text-red-600" />
                  <CardTitle className="mt-2">YouTube API Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Connect with YouTube Data API to fetch additional metadata about your watched videos.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full border-t py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How to Get Your YouTube Data</h2>
                <p className="text-muted-foreground md:text-xl">
                  Follow these steps to download your YouTube watch history from Google Takeout.
                </p>
              </div>
              <div className="grid gap-6">
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Visit Google Takeout</h3>
                    <p className="text-sm text-muted-foreground">
                      Go to{" "}
                      <a
                        href="https://takeout.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        takeout.google.com
                      </a>{" "}
                      and sign in with your Google account.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Select YouTube Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Deselect all services, then select only YouTube. Click on "All YouTube data included" and deselect
                      everything except "history".
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Create Export</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose your export frequency, file type (ZIP), and size. Then click "Create export".
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    4
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">Download and Extract</h3>
                    <p className="text-sm text-muted-foreground">
                      Once the export is ready, download and extract the ZIP file. Find the watch-history.json file in
                      the YouTube folder.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-8 text-center">
              <Link href="/">
                <Button size="lg" className="gap-1.5">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Common questions about the YouTube History Analyzer
              </p>
            </div>
            <div className="mx-auto mt-8 max-w-3xl space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Is my data safe?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Yes, all processing happens in your browser. Your watch history data never leaves your device or
                    gets stored on our servers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Why do I need to connect to YouTube API?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    The watch history from Google Takeout only contains basic information. Connecting to YouTube API
                    allows us to fetch additional metadata like video duration, view counts, and thumbnails.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>What permissions do you request?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    We only request read-only access to YouTube data. We cannot modify your account or post on your
                    behalf.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>How far back does the watch history go?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    The watch history from Google Takeout includes all videos you've watched while logged in, as long as
                    you had YouTube watch history enabled in your Google account settings.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
