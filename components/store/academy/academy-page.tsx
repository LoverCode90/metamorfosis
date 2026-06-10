"use client"

import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  Check,
  Clock,
  GraduationCap,
  MapPin,
  Scissors,
  Sparkles,
  Users,
} from "lucide-react"
import { useCart } from "../cart-context"

// ─── Social icon helpers ────────────────────────────────────────────────────

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

// ─── Data ──────────────────────────────────────────────────────────────────

const STATS = [
  { icon: Users, value: "1,200+", label: "Professionals Trained" },
  { icon: Award, value: "15 Years", label: "Industry Experience" },
  { icon: CalendarClock, value: "1–2x/Week", label: "Sessions per Week" },
  { icon: MapPin, value: "In-Person", label: "At Our Salon" },
]

const COURSES = [
  {
    number: "01",
    title: "Precision Cuts",
    tag: "BUILD YOUR FOUNDATION",
    description:
      "Master the geometry of professional haircutting — shape theory, texture work, layering, and client consultation — all taught 100% hands-on at our salon from day one.",
    bullets: ["Haircut geometry & shape theory", "Texture and layering methods", "Client consultation & diagnosis", "Finishing and styling techniques"],
    image: "/academy/course-cuts.png",
    imageLeft: true,
  },
  {
    number: "02",
    title: "Advanced Color Science",
    tag: "MASTER · COLOR AUTHORITY",
    description:
      "Dive deep into professional colorimetry — from color wheel mastery to complex balayage, highlight techniques, color correction, and 2025 global color trend forecasting. Designed exclusively for licensed professionals.",
    bullets: ["Balayage & foiling", "Color correction protocols", "2025 global color trends", "Live model case studies"],
    image: "/academy/course-color.png",
    imageLeft: false,
  },
  {
    number: "03",
    title: "Premium Nanoplasty",
    tag: "MASTER · SMOOTHING SPECIALIST",
    description:
      "Specialize in the most in-demand smoothing treatment on the market. Master the application chemistry, diagnostic workflows, safety protocols, and a complete pricing and business strategy.",
    bullets: ["Treatment chemistry & product science", "Step-by-step application protocol", "Hair type diagnosis & structure analysis", "Pricing, marketing & client retention"],
    image: "/academy/course-nano.png",
    imageLeft: true,
  },
]

const PRICING = [
  {
    id: "stylist",
    tag: "BUILD YOUR FOUNDATION",
    name: "Stylist Classes",
    price: 299,
    duration: "3-6 months · 1-2 classes/week",
    popular: false,
    bullets: [
      "100% In-person training at our salon",
      "Hands-on with real clients from day 1",
      "Basic & advanced cutting techniques",
      "Shape, texture & form theory",
      "Professional styling & finishing",
      "Client consultation methods",
      "Physical certificate of completion",
    ],
  },
  {
    id: "color",
    tag: "MASTER · COLOR AUTHORITY",
    name: "Advanced Colorimetry",
    price: 499,
    duration: "3-6 months · 1-2 classes/week",
    popular: true,
    bullets: [
      "100% In-person training at our salon",
      "Professional color theory & wheel mastery",
      "Complex balayage, highlights & foiling",
      "Advanced color correction techniques",
      "2026 global color trends & formulations",
      "Live model practices & case studies",
      "Physical certificate of completion",
    ],
  },
  {
    id: "nano",
    tag: "MASTER · SMOOTHING SPECIALIST",
    name: "Nanoplasty",
    price: 399,
    duration: "3-6 months · 1-2 classes/week",
    popular: false,
    bullets: [
      "100% In-person training at our salon",
      "Treatment chemistry & product science",
      "Step-by-step complete application protocol",
      "Hair type diagnosis & structure analysis",
      "Safety standards & client patch testing",
      "Pricing, marketing & business strategy",
      "Physical certificate of completion",
    ],
  },
]

const PROPOSITIONS = [
  { icon: MapPin, title: "100% In-Salon", body: "Hands-on practice with real clients from day one." },
  { icon: Check, title: "One-Time Fee", body: "A single, transparent payment. No subscription fees." },
  { icon: GraduationCap, title: "Physical Diploma", body: "Get a certified physical diploma upon course completion." },
  { icon: Scissors, title: "Salon Masters", body: "Taught directly by active, certified hair masters." },
]

// ─── Component ─────────────────────────────────────────────────────────────

export function AcademyPage() {
  const { setView } = useCart()

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-8 pt-16 text-center sm:px-6 sm:pt-20">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
            Professional Academy · In-Person
          </span>
        </div>

        <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Your Craft.
          <br />
          <span className="text-muted-foreground">Your Career.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          Professional in-person courses in styling, colorimetry, and treatments — taught by a
          certified master with 15 years of experience.
        </p>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: MapPin, label: "At Our Local Facility" },
            { icon: Clock, label: "3–6 Month Programs" },
            { icon: GraduationCap, label: "Physical Certificates" },
            { icon: BookOpen, label: "Licensed Professionals Only" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Instructor Card ────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-7">
          {/* Avatar + PRO badge */}
          <div className="relative shrink-0 self-start sm:self-center">
            <img
              src="/academy/instructor.png"
              alt="Valentina Restrepo"
              className="h-20 w-20 rounded-full border-2 border-border object-cover sm:h-24 sm:w-24"
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
              PRO
            </span>
          </div>

          {/* Bio */}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">Valentina Restrepo</h2>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Colorimetry Master · 15 Years of Experience
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Over 15 years transforming hair and careers. Trained in Paris and Milan, Valentina
              specializes in masterclasses exclusively for licensed beauty professionals — with more
              than 1,200 certified alumni across Latin America and Spain.
            </p>
          </div>

          {/* Social icons — stacked vertically on desktop */}
          <div className="flex gap-3 sm:flex-col sm:gap-2.5">
            {[
              { label: "TikTok", icon: <TikTokIcon /> },
              { label: "Instagram", icon: <InstagramIcon /> },
              { label: "Facebook", icon: <FacebookIcon /> },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Course Sections ──────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 xl:max-w-7xl">
        <div className="flex flex-col gap-16">
          {COURSES.map((course) => (
            <div
              key={course.number}
              className={`grid items-center gap-10 lg:grid-cols-2 ${!course.imageLeft ? "lg:[&>:first-child]:order-2" : ""}`}
            >
              {/* Text */}
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-7xl font-bold text-muted-foreground/20 leading-none select-none">
                    {course.number}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {course.tag}
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                    {course.title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {course.description}
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {course.bullets.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
                        strokeWidth={2.5}
                      />
                      <span className="text-foreground">{b}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                    3-6 Months · 1-2 Classes/Week
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                    Certificate Included
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-72 w-full object-cover lg:h-96"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm">
                  {course.tag.split("·")[0].trim()}
                </span>
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                  100% In-Person · Our Salon
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing Matrix ───────────────────────────────────────────────── */}
      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Choose Your Specialization
            </p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              One Payment.
              <br />
              Lifetime Skills.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              A single, one-time investment to secure your future. Attend hands-on,
              in-person training at our professional salon at your own pace.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PRICING.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-7 ${
                  tier.popular
                    ? "border-foreground bg-background shadow-xl"
                    : "border-border bg-card"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-background">
                    Most Popular
                  </span>
                )}

                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {tier.tag}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {tier.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-lg font-medium text-foreground">$</span>
                  <span className="text-5xl font-bold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">USD</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{tier.duration}</p>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  {tier.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
                        strokeWidth={2.5}
                      />
                      <span className="text-muted-foreground">{b}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => setView("login")}
                  className={`mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 ${
                    tier.popular
                      ? "bg-foreground text-background"
                      : "border border-border bg-background text-foreground"
                  }`}
                >
                  Enroll Now
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proposition Cards ────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 xl:max-w-7xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PROPOSITIONS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </span>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
