import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | SpringUpAI",
  description: "SpringUpAI Terms and Conditions governing use of our platform, vendor obligations, B2B relationships, and KYC compliance.",
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 25, 2026</p>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the SpringUpAI platform (&quot;Platform&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree, you must not use the Platform. These Terms constitute a legally binding agreement between you and SpringUpAI (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>&quot;Vendor&quot;</strong> — Any business entity or individual registered on the Platform to offer goods or services.</li>
              <li><strong>&quot;Buyer&quot;</strong> — Any user who purchases goods or services through the Platform.</li>
              <li><strong>&quot;B2B Transaction&quot;</strong> — Any transaction conducted between two registered business entities on the Platform.</li>
              <li><strong>&quot;Escrow&quot;</strong> — The secure holding of funds by SpringUpAI until transaction conditions are met.</li>
              <li><strong>&quot;KYC&quot;</strong> — Know Your Customer, the identity verification process required for all vendors.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Eligibility</h2>
            <p>You must be at least 18 years old and possess the legal authority to enter into binding agreements. For business accounts, you must be an authorized representative of the entity. Use of the Platform by sanctioned individuals, entities, or jurisdictions is strictly prohibited.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Vendor KYC Verification &amp; Due Diligence</h2>
            <p className="mb-2">All vendors must complete our mandatory KYC verification process before listing goods or services. This process includes but is not limited to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li><strong>Identity Verification:</strong> Government-issued photo ID (passport, national ID, or driver&apos;s license) for all directors/owners.</li>
              <li><strong>Business Registration:</strong> Certificate of incorporation, business name registration, or equivalent documentation from the relevant jurisdiction.</li>
              <li><strong>Address Verification:</strong> Utility bill, bank statement, or official correspondence dated within the last 3 months.</li>
              <li><strong>Tax Identification:</strong> Valid Tax Identification Number (TIN) or equivalent.</li>
              <li><strong>Bank Account Verification:</strong> Confirmation of a business bank account in the entity&apos;s registered name.</li>
              <li><strong>Beneficial Ownership Disclosure:</strong> Identification of all individuals owning 25% or more of the business.</li>
            </ul>
            <p className="mb-2"><strong>Enhanced Due Diligence (EDD)</strong> may be triggered for:</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>High-value transactions exceeding platform thresholds.</li>
              <li>Vendors operating in high-risk industries or jurisdictions.</li>
              <li>Politically Exposed Persons (PEPs) or their associates.</li>
              <li>Unusual transaction patterns or suspicious activity indicators.</li>
            </ul>
            <p className="font-medium text-foreground">
              SpringUpAI reserves the right to suspend, restrict, or terminate any vendor account that fails KYC verification, provides false documentation, or triggers adverse findings during ongoing monitoring. Verification status is subject to periodic review.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. B2B Relationships &amp; Obligations</h2>
            <p className="mb-2">For transactions between business entities on the Platform:</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Both parties must maintain active, verified accounts with completed KYC status.</li>
              <li>All B2B agreements facilitated through the Platform are binding upon acceptance by both parties.</li>
              <li>Vendors must accurately represent their goods, services, delivery timelines, and pricing.</li>
              <li>Buyers must honour payment obligations per agreed terms once goods/services are confirmed delivered.</li>
              <li>Both parties must comply with all applicable trade laws, export controls, and sanctions regulations.</li>
              <li>SpringUpAI acts as a facilitator and escrow agent — not a party to the underlying B2B contract.</li>
            </ul>
            <p className="mb-2"><strong>B2B Compliance Requirements:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Anti-Money Laundering (AML) compliance for all transactions.</li>
              <li>Counter-Terrorism Financing (CTF) screening of all parties.</li>
              <li>Sanctions screening against OFAC, EU, and UN consolidated lists.</li>
              <li>Ongoing transaction monitoring for suspicious patterns.</li>
              <li>Record-keeping of all transactions for a minimum of 7 years.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Escrow &amp; Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All payments are held in escrow until the buyer confirms receipt and satisfaction, or the dispute window expires.</li>
              <li>Funds are released to the vendor only after successful delivery confirmation or expiration of the buyer&apos;s review period.</li>
              <li>SpringUpAI charges a platform fee as disclosed at the time of transaction.</li>
              <li>Chargebacks, fraudulent transactions, or disputed payments may result in account suspension pending investigation.</li>
              <li>Vendors may not solicit off-platform payments for transactions initiated on the Platform.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Prohibited Activities</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Listing or selling illegal, counterfeit, stolen, or prohibited goods/services.</li>
              <li>Money laundering, terrorist financing, or any form of financial crime.</li>
              <li>Providing false, misleading, or fraudulent information during KYC or transactions.</li>
              <li>Circumventing the escrow system or platform safeguards.</li>
              <li>Engaging in market manipulation, fake reviews, or anti-competitive behaviour.</li>
              <li>Using the Platform to evade sanctions, export controls, or trade restrictions.</li>
              <li>Operating multiple accounts without disclosure or authorization.</li>
              <li>Facilitating transactions on behalf of unverified or sanctioned third parties.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Intellectual Property</h2>
            <p>
              All Platform content, branding, and technology are the property of SpringUpAI. Vendors retain ownership of their product content but grant SpringUpAI a non-exclusive license to display and promote listings on the Platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Dispute Resolution &amp; Mediation</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Disputes must first be raised through the Platform&apos;s built-in mediation system.</li>
              <li>SpringUpAI will review evidence from both parties and issue a determination within 14 business days.</li>
              <li>Escrow funds remain frozen during active disputes.</li>
              <li>If mediation fails, disputes shall be resolved through binding arbitration under the laws of the Federal Republic of Nigeria.</li>
              <li>Each party bears its own costs unless the arbitrator determines otherwise.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SpringUpAI shall not be liable for indirect, incidental, consequential, or punitive damages arising from use of the Platform. Our total liability shall not exceed the fees collected by SpringUpAI in connection with the specific transaction giving rise to the claim.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Account Suspension &amp; Termination</h2>
            <p>SpringUpAI may immediately suspend or terminate accounts for:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Failure to complete or maintain KYC verification.</li>
              <li>Violation of these Terms or applicable law.</li>
              <li>Suspicious or fraudulent activity.</li>
              <li>Non-cooperation with compliance investigations.</li>
              <li>Repeated disputes or poor performance metrics.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Data Protection &amp; Privacy</h2>
            <p>
              Your use of the Platform is also governed by our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>. KYC documentation is stored securely and processed in accordance with applicable data protection regulations including the Nigeria Data Protection Regulation (NDPR).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Amendments</h2>
            <p>
              SpringUpAI reserves the right to modify these Terms at any time. Material changes will be communicated via email or Platform notification at least 30 days before taking effect. Continued use of the Platform constitutes acceptance of modified Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes not resolved through the Platform&apos;s mediation process shall be subject to the exclusive jurisdiction of the courts of Nigeria.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">15. Contact</h2>
            <p>
              For questions regarding these Terms, contact us via{" "}
              <a href="https://wa.me/2347039986047" className="text-primary hover:underline">WhatsApp</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
