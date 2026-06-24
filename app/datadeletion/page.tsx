import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Data Deletion | SpringUpAI",
  description: "Request deletion of your personal data from SpringUpAI.",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Logo />
          <a href="/" className="text-sm font-medium text-primary hover:underline">← Home</a>
        </div>
      </header>

      <main className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Data Deletion Request</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: June 25, 2026</p>

          <section className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Your Right to Erasure</h2>
              <p>
                Under applicable data protection laws, you have the right to request that SpringUpAI delete your personal data. We will process your request within <strong className="text-foreground">30 days</strong> of receipt.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">What Gets Deleted</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your account profile (name, phone number, email)</li>
                <li>Transaction history and payment records (where legally permissible)</li>
                <li>WhatsApp conversation logs linked to your account</li>
                <li>KYC documents and identity verification data</li>
                <li>Any vendor listings or service profiles</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">What May Be Retained</h2>
              <p className="mb-2">
                Certain data may be retained as required by law or for legitimate business purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Financial records required for tax or regulatory compliance (typically 7 years)</li>
                <li>Fraud prevention records</li>
                <li>Anonymised, aggregated data that cannot identify you</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">How to Submit a Request</h2>
              <p className="mb-4">Send your data deletion request via WhatsApp or email with the subject line <strong className="text-foreground">&quot;Data Deletion Request&quot;</strong> and include:</p>
              <ul className="list-disc pl-6 space-y-1 mb-6">
                <li>Your full name</li>
                <li>The phone number associated with your account</li>
                <li>A brief reason (optional)</li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/2347039986047?text=Data%20Deletion%20Request%20-%20Please%20delete%20my%20SpringUpAI%20account%20and%20personal%20data."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-elevated"
                >
                  Request via WhatsApp
                </a>
                <a
                  href="mailto:privacy@springupai.com?subject=Data%20Deletion%20Request"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-full font-semibold text-sm text-foreground hover:bg-muted transition-colors"
                >
                  Request via Email
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Processing Timeline</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong className="text-foreground">Acknowledgement:</strong> Within 48 hours of your request</li>
                <li><strong className="text-foreground">Identity verification:</strong> We may ask you to confirm your identity before processing</li>
                <li><strong className="text-foreground">Completion:</strong> Within 30 days of a verified request</li>
                <li><strong className="text-foreground">Confirmation:</strong> We will notify you once deletion is complete</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
              <p>
                For any questions about data deletion or your privacy rights, contact us at{" "}
                <a href="https://wa.me/2347039986047" className="text-primary hover:underline">WhatsApp</a>{" "}
                or{" "}
                <a href="mailto:privacy@springupai.com" className="text-primary hover:underline">privacy@springupai.com</a>.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
