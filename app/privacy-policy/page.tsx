import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Privacy Policy | SpringUpAI",
  description: "SpringUpAI Privacy Policy - How we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 20, 2026</p>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Introduction</h2>
            <p>
              SpringUpAI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Information We Collect</h2>
            <p className="mb-2">We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Personal Information:</strong> Name, email address, phone number, and payment details provided during registration or transactions.</li>
              <li><strong>Business Information:</strong> Vendor business name, description, and service offerings.</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns on our platform.</li>
              <li><strong>Device Information:</strong> Browser type, IP address, device type, and operating system.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide, maintain, and improve our services.</li>
              <li>To process transactions and manage escrow payments.</li>
              <li>To communicate with you about your account, orders, or support requests.</li>
              <li>To verify vendor identities through KYC processes.</li>
              <li>To detect and prevent fraud or abuse.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform (payment processors, hosting providers).</li>
              <li><strong>Other Users:</strong> Limited information shared between buyers and vendors to facilitate transactions.</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide services. We may retain certain information as required by law or for legitimate business purposes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access and receive a copy of your personal data.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your data (subject to legal obligations).</li>
              <li>Withdraw consent for data processing.</li>
              <li>Object to certain data processing activities.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can manage cookie preferences through your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="https://wa.me/2347039986047" className="text-primary hover:underline">
                WhatsApp
              </a>.
            </p>
          </div>
        </section>
      </div>
      </main>
    </div>
  );
}
