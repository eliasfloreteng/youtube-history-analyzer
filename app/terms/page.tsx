import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader activePath="/terms" />
      <main className="flex-1">
        <div className="container max-w-3xl py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold tracking-tighter mb-6">Terms of Service</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p>Last updated: May 13, 2025</p>

            <h2>Introduction</h2>

            <p>
              Welcome to YouTube History Analyzer. By using our application, you agree to these Terms of Service. Please
              read them carefully.
            </p>

            <h2>Description of Service</h2>

            <p>
              YouTube History Analyzer is a web application that allows you to upload your YouTube watch history data
              from Google Takeout and analyze it to gain insights about your viewing habits. The application also
              connects to the YouTube Data API to fetch additional metadata about the videos in your watch history.
            </p>

            <h2>Your Data</h2>

            <p>
              You retain all rights to your data. Our application processes your data locally in your browser, and we do
              not store, share, or use your data for any purpose other than providing the service to you.
            </p>

            <h2>YouTube API Services</h2>

            <p>
              Our application uses the YouTube API Services. By using our application, you are also agreeing to be bound
              by the{" "}
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
                YouTube Terms of Service
              </a>
              .
            </p>

            <h2>Limitations</h2>

            <p>
              Our application is provided "as is" without any warranties, expressed or implied. We do not guarantee that
              the application will be error-free or uninterrupted.
            </p>

            <p>We are not responsible for the accuracy of the data provided by Google Takeout or the YouTube API.</p>

            <h2>Changes to Terms</h2>

            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify you of any changes by
              posting the new Terms of Service on this page and updating the "Last updated" date.
            </p>

            <h2>Contact Us</h2>

            <p>If you have any questions about these Terms of Service, please contact us.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
