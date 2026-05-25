import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | SpringUpAI",
  description: "SpringUpAI Refund Policy - Conditions, timelines, and procedures for refund requests.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 25, 2026</p>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Overview</h2>
            <p>
              SpringUpAI facilitates transactions between buyers and vendors through a secure escrow system. This Refund Policy outlines the conditions under which refunds may be issued and the process for requesting them. All refunds are subject to verification, compliance checks, and the terms of the original transaction.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Escrow-Based Refund Protection</h2>
            <p className="mb-2">Since all payments are held in escrow until delivery confirmation:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Funds are not released to the vendor until the buyer confirms satisfactory receipt.</li>
              <li>If a dispute is raised before escrow release, funds remain frozen pending resolution.</li>
              <li>Refunds from escrow are processed within 3–5 business days of approval.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Eligibility for Refund</h2>
            <p className="mb-2">A refund may be granted under the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Non-Delivery:</strong> The vendor fails to deliver goods/services within the agreed timeframe.</li>
              <li><strong>Significantly Not as Described:</strong> The delivered goods/services materially differ from the listing description.</li>
              <li><strong>Defective Goods:</strong> Items received are damaged, non-functional, or unfit for purpose.</li>
              <li><strong>Duplicate Payment:</strong> Buyer was charged more than once for the same transaction.</li>
              <li><strong>Vendor Cancellation:</strong> The vendor cancels the order before fulfilment.</li>
              <li><strong>Fraud/Unauthorized Transaction:</strong> The transaction was not authorized by the account holder.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Non-Refundable Situations</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Buyer&apos;s remorse or change of mind after confirming delivery.</li>
              <li>Services already rendered and accepted by the buyer.</li>
              <li>Digital goods accessed or downloaded by the buyer.</li>
              <li>Customized or bespoke items made to buyer&apos;s specifications.</li>
              <li>Disputes raised after the review window has expired (14 days post-delivery).</li>
              <li>Transactions where the buyer confirmed receipt without raising concerns.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Refund Request Process</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Raise a Dispute:</strong> Submit a dispute through the Platform&apos;s mediation system within 14 days of delivery (or expected delivery date for non-delivery cases).</li>
              <li><strong>Provide Evidence:</strong> Upload supporting documentation — photos, screenshots, communications, tracking information, or other relevant proof.</li>
              <li><strong>Vendor Response:</strong> The vendor has 5 business days to respond to the dispute with their evidence.</li>
              <li><strong>Mediation Review:</strong> SpringUpAI reviews all evidence and issues a determination within 14 business days.</li>
              <li><strong>Resolution:</strong> If approved, the refund is processed to the original payment method.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Refund Timelines</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border mt-2">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border px-3 py-2 text-left text-foreground">Scenario</th>
                    <th className="border border-border px-3 py-2 text-left text-foreground">Processing Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-3 py-2">Escrow (pre-release)</td>
                    <td className="border border-border px-3 py-2">3–5 business days</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">Post-release (approved dispute)</td>
                    <td className="border border-border px-3 py-2">7–14 business days</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">Duplicate payment</td>
                    <td className="border border-border px-3 py-2">1–3 business days</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-3 py-2">Fraud/unauthorized</td>
                    <td className="border border-border px-3 py-2">Subject to investigation (up to 30 days)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Partial Refunds</h2>
            <p>Partial refunds may be issued when:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Only part of an order was affected (e.g., some items defective, others satisfactory).</li>
              <li>The buyer agrees to keep the goods at a reduced price.</li>
              <li>Services were partially rendered before cancellation.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. B2B Transaction Refunds</h2>
            <p className="mb-2">For business-to-business transactions, additional conditions apply:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Refund requests must be submitted by an authorized representative of the purchasing entity.</li>
              <li>Bulk order refunds may require inspection and return of goods before processing.</li>
              <li>Custom B2B contracts may supersede this general policy — refer to your specific agreement terms.</li>
              <li>Refunds exceeding platform thresholds require enhanced verification and may take additional processing time.</li>
              <li>Both parties&apos; compliance status must be current for refund processing.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Vendor Obligations</h2>
            <p>Vendors who receive a high volume of refund requests may face:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Account review and potential performance warnings.</li>
              <li>Increased escrow hold periods.</li>
              <li>Temporary or permanent suspension from the Platform.</li>
              <li>Enhanced monitoring and reporting requirements.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Fraud Prevention</h2>
            <p>
              All refund requests are subject to anti-fraud analysis. Abuse of the refund system — including false claims, return fraud, or collusion — will result in immediate account termination, forfeiture of funds, and potential referral to law enforcement authorities.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Contact</h2>
            <p>
              For refund inquiries, contact us via{" "}
              <a href="https://wa.me/2347039986047" className="text-primary hover:underline">WhatsApp</a>{" "}
              or use the Platform&apos;s dispute system.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
