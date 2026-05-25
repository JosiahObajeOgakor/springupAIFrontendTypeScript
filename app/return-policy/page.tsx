import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy | SpringUpAI",
  description: "SpringUpAI Return Policy - Guidelines for returning goods purchased through the platform.",
};

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Return Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 25, 2026</p>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Overview</h2>
            <p>
              This Return Policy governs the return of physical goods purchased through the SpringUpAI platform. Returns are facilitated through our escrow and mediation system to ensure fair resolution for both buyers and vendors.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Return Eligibility</h2>
            <p className="mb-2">Items may be returned if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>The item is materially different from what was described in the listing.</li>
              <li>The item is defective, damaged during shipping, or non-functional.</li>
              <li>The wrong item was delivered.</li>
              <li>The item does not meet stated quality standards or specifications.</li>
              <li>The return is initiated within 14 days of confirmed delivery.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Non-Returnable Items</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Perishable goods (food, flowers, etc.).</li>
              <li>Personal hygiene products that have been opened or used.</li>
              <li>Custom-made or personalized items manufactured to buyer&apos;s specifications.</li>
              <li>Digital products, software licenses, or downloadable content.</li>
              <li>Services that have been fully rendered.</li>
              <li>Items marked as &quot;final sale&quot; or &quot;non-returnable&quot; in the listing.</li>
              <li>Items returned after the 14-day return window.</li>
              <li>Items that have been altered, modified, or damaged by the buyer.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Return Process</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Initiate Return:</strong> Submit a return request through the Platform&apos;s dispute/mediation system within 14 days of delivery. Include clear photos and description of the issue.</li>
              <li><strong>Vendor Acknowledgment:</strong> The vendor has 3 business days to acknowledge the return request and provide a return shipping address or alternative resolution.</li>
              <li><strong>Ship Item Back:</strong> Pack the item securely in its original packaging (where possible) and ship it to the vendor&apos;s designated address. Retain proof of shipment.</li>
              <li><strong>Inspection:</strong> The vendor has 5 business days after receiving the returned item to inspect it and confirm its condition.</li>
              <li><strong>Resolution:</strong> Upon successful inspection, the refund is processed or a replacement is shipped.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Return Condition Requirements</h2>
            <p className="mb-2">Returned items must be:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>In the same condition as received (unless the issue is the defect itself).</li>
              <li>In original packaging with all tags, labels, and accessories included.</li>
              <li>Accompanied by proof of purchase (order number or transaction reference).</li>
              <li>Free from buyer-caused damage, wear, or alterations.</li>
            </ul>
            <p className="mt-2">
              Items returned in a condition different from what was received (excluding the reported defect) may be subject to a partial refund or rejection.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Return Shipping</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Vendor&apos;s fault</strong> (wrong item, defective, not as described): Vendor bears return shipping costs.</li>
              <li><strong>Buyer&apos;s preference</strong> (where vendor agrees to accept): Buyer bears return shipping costs.</li>
              <li>Both parties must use trackable shipping methods with delivery confirmation.</li>
              <li>SpringUpAI is not responsible for items lost or damaged during return transit. Buyers should insure high-value returns.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. B2B Returns</h2>
            <p className="mb-2">For business-to-business transactions, additional terms apply:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bulk returns must be coordinated directly with the vendor through the Platform&apos;s mediation system.</li>
              <li>Return requests must be submitted by an authorized representative with documented authority.</li>
              <li>Quality inspection reports may be required for bulk returns.</li>
              <li>Custom B2B agreements may specify different return windows and conditions — contractual terms take precedence.</li>
              <li>Restocking fees of up to 15% may apply for bulk returns that are not due to vendor fault.</li>
              <li>Both parties must maintain compliant KYC status throughout the return process.</li>
              <li>Returns of regulated or controlled goods must comply with all applicable import/export regulations.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Vendor Compliance &amp; KYC During Returns</h2>
            <p className="mb-2">Vendors must:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintain valid KYC verification throughout the return process.</li>
              <li>Respond to return requests within the specified timeframe.</li>
              <li>Provide accurate return shipping information.</li>
              <li>Process inspections honestly and in good faith.</li>
              <li>Not impose unreasonable barriers to legitimate returns.</li>
            </ul>
            <p className="mt-2">
              Vendors with excessive return rates or who consistently obstruct legitimate returns will be subject to enhanced review, performance penalties, and potential account suspension.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Dispute Escalation</h2>
            <p>If the buyer and vendor cannot agree on a return resolution:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Either party may escalate to SpringUpAI mediation.</li>
              <li>SpringUpAI will review all evidence (photos, tracking, communications) and issue a binding determination.</li>
              <li>Escrow funds remain frozen until the dispute is resolved.</li>
              <li>Mediation decisions are final and binding on both parties (subject to the arbitration clause in our <a href="/terms-and-conditions" className="text-primary hover:underline">Terms and Conditions</a>).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Return Fraud</h2>
            <p>
              SpringUpAI takes return fraud seriously. Submitting false return claims, returning substituted or counterfeit items, or engaging in &quot;wardrobing&quot; (using items and returning them) will result in:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Immediate account suspension.</li>
              <li>Forfeiture of escrow funds.</li>
              <li>Permanent ban from the Platform.</li>
              <li>Referral to law enforcement where appropriate.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Contact</h2>
            <p>
              For return-related inquiries, contact us via{" "}
              <a href="https://wa.me/2347039986047" className="text-primary hover:underline">WhatsApp</a>{" "}
              or initiate a return through the Platform&apos;s mediation system.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
