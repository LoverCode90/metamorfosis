import { ArrowRight } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AboutSectionHeading } from "@/components/marketing/about/about-section-heading"
import { FAQS } from "@/lib/marketing/about-content"

/** FAQ accordion plus a "still have questions?" contact call-to-action. */
export function AboutFaqs() {
  return (
    <section className="mx-auto max-w-3xl">
      <AboutSectionHeading
        eyebrow="FAQs"
        title="Have questions? We've got answers"
      />

      <Accordion className="mt-10">
        {FAQS.map((faq, faqIndex) => (
          <AccordionItem key={faq.q} value={`faq-${faqIndex}`}>
            <AccordionTrigger className="text-foreground py-5 text-base">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pr-6 text-sm leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="border-border bg-card mt-12 flex flex-col items-center gap-4 rounded-2xl border px-6 py-10 text-center">
        <h3 className="text-foreground text-lg font-semibold">
          Can&apos;t find your answer?
        </h3>
        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
          Get in touch with our team — we&apos;re friendly and happy to help.
        </p>
        <a
          href="mailto:hello@metamorfosisllc.com?subject=Question%20from%20Website"
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          Contact Us
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}
