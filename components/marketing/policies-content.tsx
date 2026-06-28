"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const LAST_UPDATED = "June 2026"

/** Full store policies: returns, shipping, pro verification, cancellation, privacy, contact. */
export function PoliciesContent() {
  const router = useRouter()

  return (
    <div className="space-y-10">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Go back
      </Button>

      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Policies &amp; Privacy
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <PolicySection title="Return Policy">
        <p>
          Items may be returned within 14 days of delivery, subject to the
          following conditions:
        </p>
        <ul>
          <li>Items must be unused, unopened, and in original packaging.</li>
          <li>
            Chemical products (bleach, developer, permanent hair color) are
            final sale and cannot be returned once shipped.
          </li>
          <li>
            Items valued under $15.00 are not eligible for return due to
            shipping logistics costs.
          </li>
          <li>
            Return shipping costs are the responsibility of the customer unless
            the item arrived damaged, was the wrong item, or is defective — in
            which case Metamorfosis LLC covers all shipping costs.
          </li>
          <li>
            Refunds are processed only after the returned item is received and
            inspected at our location. Refund amount will be net of return
            shipping label cost and applicable card processing fees.
          </li>
          <li>
            Return requests must be submitted through your account at
            metamorfosisllc.com within the 14-day window. Requests submitted
            after 14 days of delivery will not be accepted.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Shipping Policy">
        <p>
          We ship exclusively within the continental United States. We do not
          ship to Hawaii, Alaska, or US territories at this time.
        </p>
        <ul>
          <li>
            Shipping rates are calculated in real time by our carrier partners
            (USPS, UPS, FedEx) at checkout based on your address and order
            weight.
          </li>
          <li>Free standard shipping is available on orders over $70.00.</li>
          <li>
            Delivery estimates are not guaranteed and may vary based on carrier
            delays.
          </li>
          <li>
            Store pickup is available at our Ontario, CA location at no charge.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Professional Products &amp; Verification">
        <p>
          Certain products in our catalog are designated as professional-only
          and require a valid cosmetology, esthetician, or salon license to
          purchase.
        </p>
        <ul>
          <li>
            To purchase professional products, you must submit your license for
            verification through your account profile.
          </li>
          <li>
            License verification is reviewed by our team within 1–3 business
            days.
          </li>
          <li>
            Approved professionals enjoy unrestricted access to all
            professional-grade products.
          </li>
          <li>
            Submitting a fraudulent or expired license will result in immediate
            account suspension.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Cancellation Policy">
        <p>
          Orders may be cancelled within 2 hours of placement. After 2 hours,
          orders enter processing and cancellation is no longer available.
        </p>
        <ul>
          <li>
            To cancel, visit My Orders in your account and press &ldquo;Cancel
            Order&rdquo; within the 2-hour window.
          </li>
          <li>
            Refunds for cancelled orders are processed within 3–5 business days
            to your original payment method.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Privacy Policy">
        <p>
          Metamorfosis LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
          &ldquo;our&rdquo;) collects and uses your personal information to
          process orders, communicate with you, and improve our services.
        </p>
        <ul>
          <li>
            <strong>Information collected:</strong> name, email address,
            shipping address, phone number (for shipping purposes), and payment
            method (tokenized — we never store raw card numbers).
          </li>
          <li>
            <strong>How we use it:</strong> to fulfill orders, send order
            updates, respond to customer service requests, and comply with legal
            obligations.
          </li>
          <li>
            <strong>Terms acceptance:</strong> your acceptance of these terms at
            checkout is logged with a timestamp and IP address for legal
            record-keeping purposes.
          </li>
          <li>
            <strong>We do not sell</strong> your personal information to third
            parties.
          </li>
          <li>
            <strong>Third-party services:</strong> we use Square for payment
            processing, Shippo for shipping, and Supabase for secure data
            storage. Each is bound by their own privacy policies.
          </li>
          <li>
            To request deletion of your data, email us at
            hello@metamorfosisllc.com.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Contact">
        <p>For questions about these policies, contact us at:</p>
        <ul>
          <li>
            Email:{" "}
            <a
              href="mailto:hello@metamorfosisllc.com"
              className="text-foreground underline hover:opacity-80"
            >
              hello@metamorfosisllc.com
            </a>
          </li>
          <li>Address: 211 W B St, Ontario, CA 91762</li>
          <li>Phone: +1 (909) 278-0535</li>
        </ul>
      </PolicySection>
    </div>
  )
}

function PolicySection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-foreground text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground space-y-2 text-sm leading-relaxed [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  )
}
