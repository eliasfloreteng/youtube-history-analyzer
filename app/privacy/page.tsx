import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader activePath="/privacy" />
      <main className="flex-1">
        <div className="container max-w-3xl py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold tracking-tighter mb-6">Privacy Policy</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p>Last updated: May 13, 2025</p>

            <h2>Introduction</h2>

            <p>
              Welcome to the YouTube History Analyzer Privacy Policy. This policy describes how we handle your data when
              you use our application.
            </p>

            <p>
              We are committed to protecting your privacy and ensuring that your personal information is handled
              securely and responsibly.
            </p>

            <h2>Data Collection and Processing</h2>

            <p>Our application is designed with privacy as a core principle. Here's how we handle your data:</p>

            <ul>
              <li>
                <strong>Local Processing:</strong> All data processing happens locally in your browser. Your YouTube
                watch history data never leaves your device.
              </li>
              <li>
                <strong>No Server Storage:</strong> We do not upload, store, or process your data on our servers.
              </li>
              <li>
                <strong>Local Storage:</strong> Your analyzed data is temporarily stored in your browser's local storage
                for the duration of your session.
              </li>
            </ul>

            <h2>YouTube API Services</h2>

            <p>
              Our application uses the YouTube API Services to fetch additional metadata about videos in your watch
              history. By using our application, you are also subject to the{" "}
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
                YouTube Terms of Service
              </a>{" "}
              and{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Privacy Policy
              </a>
              .
            </p>

            <p>We request only the minimum necessary permissions to provide our service:</p>

            <ul>
              <li>Read-only access to YouTube data (we cannot modify your account or post on your behalf)</li>
              <li>Access to fetch video metadata for videos in your watch history</li>
            </ul>

            <h2>OAuth Authentication</h2>

            <p>
              When you connect your YouTube account, we use OAuth 2.0 for authentication. This secure protocol allows
              you to grant our application limited access to your YouTube data without sharing your password.
            </p>

            <p>
              The access token we receive is stored only in your browser's local storage and is used solely for making
              API requests to fetch video metadata.
            </p>

            <h2>Cookies and Tracking</h2>

            <p>Our application does not use cookies or any tracking technologies to collect information about you.</p>

            <h2>Changes to This Privacy Policy</h2>

            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2>Contact Us</h2>

            <p>If you have any questions about this Privacy Policy, please contact us.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
