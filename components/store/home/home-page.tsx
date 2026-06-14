"use client"

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MapPin,
  Palette,
  Scissors,
  Sparkles,
} from "lucide-react"
import { useCart } from "../cart-context"

// ─── Inline SVG icons for map service buttons ──────────────────────────────

function WazeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.25 4.28C18.19 2.1 15.27 1 12.23 1 6.14 1 1.17 5.95 1.17 12.03c0 1.88.5 3.73 1.45 5.37L1.1 21.5c-.09.34.01.7.26.94.19.19.44.29.7.29.08 0 .16-.01.24-.03l4.22-1.14c1.56.87 3.34 1.34 5.13 1.34h.01C17.76 22.9 22.86 17.8 22.86 12c0-3-.11-5.6-2.61-7.72zM12.22 21.1c-1.6 0-3.17-.44-4.53-1.27l-.32-.19-3.37.91.91-3.28-.21-.34C3.73 15.53 3.2 13.8 3.2 12.03c0-5 4.04-9.04 9.04-9.04 2.43 0 4.7.94 6.41 2.65 1.71 1.7 2.4 4.1 2.4 6.4 0 5-4.18 9.06-8.83 9.06zm5.03-6.62c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.13-.62.14-.18.27-.72.89-.88 1.07-.16.18-.33.21-.6.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.47-.16-.01-.34-.01-.53-.01s-.48.07-.74.34c-.25.27-.97.95-.97 2.32s.99 2.69 1.13 2.88c.14.18 1.95 2.98 4.73 4.18.66.29 1.18.46 1.58.58.66.21 1.27.18 1.75.11.53-.08 1.62-.66 1.85-1.3.23-.64.23-1.19.16-1.3-.07-.11-.25-.18-.53-.32z" />
    </svg>
  )
}

function AppleMapIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────

const BRAND_LINES = [
  {
    id: "nutrapel",
    name: "Nutrapel",
    tagline: "Bond-strengthening care system",
    category: "Bond & Repair",
    image: "/home/brand-nutrapel.png",
  },
  {
    id: "bbcos",
    name: "BBCos",
    tagline: "Professional permanent color line",
    category: "Color",
    image: "/home/brand-bbcos.png",
  },
  {
    id: "brazilian-nano",
    name: "Brazilian Nano",
    tagline: "Premium nanoplasty treatment range",
    category: "Smoothing",
    image: "/home/brand-nano.png",
  },
  {
    id: "level3",
    name: "Level 3",
    tagline: "Technical styling gel & fiber system",
    category: "Styling",
    image: "/home/brand-level3.png",
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

export function HomePage() {
  const { setView } = useCart()

  return (
    <div className="flex flex-col gap-y-24">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-foreground">
        <img
          src="/home/hero-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Asymmetric gradient: very dark left for text legibility, almost transparent right so image shows */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.75) 36%, rgba(0,0,0,0.28) 68%, rgba(0,0,0,0.06) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 xl:max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/50">
            Professional Color Lab
          </p>
          <h1 className="mt-5 max-w-2xl text-balance text-5xl font-semibold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Salon-grade color,
            <br />
            perfected.
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-sm leading-relaxed text-white/65 sm:text-base">
            Permanent crème color, bond care, and professional tools — engineered for
            colorists who refuse to compromise.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setView("products")}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Shop the catalog
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setView("academy")}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-primary/30 px-6 text-sm font-semibold text-white/85 transition-colors hover:border-primary/60 hover:text-white"
            >
              Explore Academy
            </button>
          </div>
        </div>
      </section>

      {/* ── Brand Lines ────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Our Lines
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Four pillars of professional care
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {BRAND_LINES.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => setView("products")}
              className="group flex items-center gap-5 rounded-2xl border-2 border-primary/20 bg-card p-5 text-left transition-all hover:border-primary/50 hover:bg-primary/5 sm:gap-7"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-secondary/30 bg-background sm:h-24 sm:w-24">
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                  {brand.category}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {brand.name}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{brand.tagline}</p>
              </div>
              <ArrowRight
                className="mr-1 h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                strokeWidth={1.75}
              />
            </button>
          ))}
        </div>
      </section>

      {/* ── Kits Section: Enhanced with Brand Colors ── */}
      <section className="bg-gradient-to-b from-secondary/5 to-transparent py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
              Curated for Professionals
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Ready-to-work kits
            </h2>
          </div>

          {/* 2×2 solid-background card grid with vibrant accents */}
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-secondary/20 bg-secondary/10 sm:grid-cols-2">
            {[
              {
                tag: "Most Complete",
                title: "Full Colorimetry Kit",
                items: [
                  "Developer 10 / 20 / 30 / 40 vol",
                  "24 permanent shades",
                  "Mixing bowls · tint brushes · foil sheets",
                  "Nitrile gloves · laminated color chart",
                ],
                dark: true,
              },
              {
                tag: "Bond & Repair",
                title: "Bond Care Bundle",
                items: [
                  "Bond Serum 50 ml",
                  "Repair Mask 200 ml",
                  "Protective Spray 150 ml",
                ],
                dark: false,
              },
              {
                tag: "Smoothing",
                title: "Smoothing Trio",
                items: [
                  "Pre-cleanser 300 ml",
                  "Nano formula 500 ml",
                  "Finishing serum 100 ml",
                ],
                dark: false,
              },
              {
                tag: "Color Correction",
                title: "Toner & Pigment Set",
                items: [
                  "Cool-ash toner — 3 shades",
                  "Violet pigment booster",
                  "10 vol developer",
                ],
                dark: true,
              },
            ].map((kit) => (
              <button
                key={kit.title}
                type="button"
                onClick={() => setView("products")}
                className={[
                  "group flex flex-col justify-between p-8 text-left transition-all hover:shadow-lg",
                  kit.dark ? "bg-gradient-to-br from-foreground to-foreground/95" : "bg-gradient-to-br from-card to-card/50",
                ].join(" ")}
              >
                <div>
                  <span
                    className={[
                      "inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em]",
                      kit.dark
                        ? "bg-secondary/30 text-secondary-foreground"
                        : "bg-primary/10 text-primary",
                    ].join(" ")}
                  >
                    {kit.tag}
                  </span>
                  <h3
                    className={[
                      "mt-3 text-xl font-semibold tracking-tight",
                      kit.dark ? "text-white" : "text-foreground",
                    ].join(" ")}
                  >
                    {kit.title}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-1.5">
                    {kit.items.map((item) => (
                      <li
                        key={item}
                        className={[
                          "flex items-start gap-2 text-sm",
                          kit.dark ? "text-white/70" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        <span className={[
                          "mt-[5px] h-1 w-1 shrink-0 rounded-full",
                          kit.dark ? "bg-secondary/50" : "bg-primary/40"
                        ].join(" ")} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <span
                  className={[
                    "mt-8 inline-flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2",
                    kit.dark ? "text-secondary/70 group-hover:text-secondary" : "text-primary/70 group-hover:text-primary",
                  ].join(" ")}
                >
                  View kit <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Academy Teaser ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 xl:max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid gap-0 lg:grid-cols-2">
            {/* Left — copy */}
            <div className="flex flex-col justify-center p-10 sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Education
              </p>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Tenemos clases profesionales donde te enseñamos cosas que no te
                enseñan en otros lugares.
              </h2>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                100% presencial en nuestro salón. Sin subscripciones. Una inversión,
                habilidades de por vida — impartidas por una maestra certificada con
                más de 15 años de experiencia.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-5">
                {[
                  { icon: Scissors, label: "Corte y diseño" },
                  { icon: Palette, label: "Colorimetría" },
                  { icon: Sparkles, label: "Nanoplastia" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                    </span>
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setView("academy")}
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Explorar Academia
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Right — visual accent with brand colors */}
            <div className="hidden items-center justify-center bg-gradient-to-br from-primary to-primary/90 p-10 lg:flex">
              <div className="flex flex-col gap-5">
                {[
                  { icon: BookOpen, label: "3–6 Month Programs" },
                  { icon: GraduationCap, label: "Physical Certificate" },
                  { icon: MapPin, label: "At Our Local Facility" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-secondary/30 bg-secondary/20 px-5 py-4"
                  >
                    <Icon className="h-5 w-5 text-secondary" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-white">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map Footer with Brand Colors ─────────────────────────────── */}
      <footer className="border-t-2 border-primary/20 bg-gradient-to-b from-secondary/5 to-background pb-20">
        <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 xl:max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left — simulated Google Map placeholder */}
            <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl border-2 border-primary/20 bg-muted lg:min-h-[460px]">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <MapPin className="h-10 w-10 text-primary" strokeWidth={1.25} />
                <span className="text-base font-medium">Google Map Preview</span>
                <span className="text-sm">Los Angeles, CA</span>
              </div>
            </div>

            {/* Right — links + contact */}
            <div className="flex flex-col gap-9">
              <div className="grid grid-cols-3 gap-6">
                {[
                  {
                    title: "Menu",
                    links: ["Home", "Products", "Academy", "About", "Contact"],
                  },
                  {
                    title: "Services",
                    links: ["Colorimetría", "Nanoplastia", "Corte", "Bond Care", "Kits"],
                  },
                  {
                    title: "References",
                    links: ["Nutrapel", "BBCos", "Brazilian Nano", "Level 3"],
                  },
                ].map((col) => (
                  <div key={col.title}>
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {col.title}
                    </p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {col.links.map((link) => (
                        <li key={link}>
                          <span className="cursor-default text-sm text-muted-foreground transition-colors hover:text-foreground">
                            {link}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="border-t border-border" />

              {/* Contact — email + address only (no phone per spec) */}
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Contact us</p>
                  <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <span>
                      <span className="font-semibold text-foreground">Email: </span>
                      info@metamorfosis.com
                    </span>
                    <span>
                      <span className="font-semibold text-foreground">Address: </span>
                      Los Angeles, CA 90069
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { label: "Google Map", icon: <MapPin className="h-4 w-4" strokeWidth={1.75} /> },
                    { label: "Waze Map", icon: <WazeIcon /> },
                    { label: "Apple Map", icon: <AppleMapIcon /> },
                  ].map(({ label, icon }) => (
                    <button
                      key={label}
                      type="button"
                      className="flex h-9 items-center gap-2.5 rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social icons row */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <SocialButton label="X (Twitter)">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.726-8.857L1.5 2.25H8.82l4.243 5.612L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                    </svg>
                  </SocialButton>
                  <SocialButton label="WhatsApp">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </SocialButton>
                  <SocialButton label="LinkedIn">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </SocialButton>
                  <SocialButton label="Instagram">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </SocialButton>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Metamorfosis Lab. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
    >
      {children}
    </button>
  )
}
