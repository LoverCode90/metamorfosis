import { MapPin } from "lucide-react"

function WazeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.25 4.28C18.19 2.1 15.27 1 12.23 1 6.14 1 1.17 5.95 1.17 12.03c0 1.88.5 3.73 1.45 5.37L1.1 21.5c-.09.34.01.7.26.94.19.19.44.29.7.29.08 0 .16-.01.24-.03l4.22-1.14c1.56.87 3.34 1.34 5.13 1.34h.01C17.76 22.9 22.86 17.8 22.86 12c0-3-.11-5.6-2.61-7.72zM12.22 21.1c-1.6 0-3.17-.44-4.53-1.27l-.32-.19-3.37.91.91-3.28-.21-.34C3.73 15.53 3.2 13.8 3.2 12.03c0-5 4.04-9.04 9.04-9.04 2.43 0 4.7.94 6.41 2.65 1.71 1.7 2.4 4.1 2.4 6.4 0 5-4.18 9.06-8.83 9.06zm5.03-6.62c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.13-.62.14-.18.27-.72.89-.88 1.07-.16.18-.33.21-.6.07-.27-.14-1.15-.42-2.19-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.47-.16-.01-.34-.01-.53-.01s-.48.07-.74.34c-.25.27-.97.95-.97 2.32s.99 2.69 1.13 2.88c.14.18 1.95 2.98 4.73 4.18.66.29 1.18.46 1.58.58.66.21 1.27.18 1.75.11.53-.08 1.62-.66 1.85-1.3.23-.64.23-1.19.16-1.3-.07-.11-.25-.18-.53-.32z" />
    </svg>
  )
}

function AppleMapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  )
}

const NAV_COLUMNS = [
  { title: "Menu", links: ["Home", "Products", "About", "Contact"] },
  {
    title: "Services",
    links: ["Colorimetry", "Nanoplasty", "Haircut", "Bond Care", "Kits"],
  },
  {
    title: "References",
    links: ["Nutrapel", "BBCos", "Brazilian Nano", "Level 3"],
  },
]

const MAP_LINKS = [
  {
    label: "Google Map",
    icon: <MapPin className="h-4 w-4" strokeWidth={1.75} />,
  },
  { label: "Waze Map", icon: <WazeIcon /> },
  { label: "Apple Map", icon: <AppleMapIcon /> },
]

export function HomeFooter() {
  return (
    <footer className="border-border bg-background border-t pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 xl:max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="border-border bg-muted flex min-h-[360px] items-center justify-center overflow-hidden rounded-3xl border lg:min-h-[460px]">
            <div className="text-muted-foreground flex flex-col items-center gap-3">
              <MapPin className="h-10 w-10" strokeWidth={1.25} />
              <span className="text-base font-medium">Google Map Preview</span>
              <span className="text-sm">Los Angeles, CA</span>
            </div>
          </div>

          <div className="flex flex-col gap-9">
            <div className="grid grid-cols-3 gap-6">
              {NAV_COLUMNS.map((col) => (
                <div key={col.title}>
                  <p className="text-foreground text-xs font-bold tracking-wider uppercase">
                    {col.title}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <span className="text-muted-foreground hover:text-foreground cursor-default text-sm transition-colors">
                          {link}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-border border-t" />

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Contact us
                </p>
                <div className="text-muted-foreground mt-3 flex flex-col gap-1.5 text-sm">
                  <span>
                    <span className="text-foreground font-semibold">
                      Email:{" "}
                    </span>
                    info@metamorfosis.com
                  </span>
                  <span>
                    <span className="text-foreground font-semibold">
                      Address:{" "}
                    </span>
                    Los Angeles, CA 90069
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {MAP_LINKS.map(({ label, icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="border-border text-foreground hover:bg-muted flex h-9 items-center gap-2.5 rounded-md border px-4 text-sm font-medium transition-colors"
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-border border-t pt-6">
              <div className="flex items-center gap-3">
                {[
                  {
                    label: "X (Twitter)",
                    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.726-8.857L1.5 2.25H8.82l4.243 5.612L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
                  },
                  {
                    label: "WhatsApp",
                    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
                  },
                  {
                    label: "Instagram",
                    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
                  },
                ].map(({ label, path }) => (
                  <button
                    key={label}
                    type="button"
                    aria-label={label}
                    className="border-border text-foreground hover:bg-muted flex h-10 w-10 items-center justify-center rounded-md border transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="currentColor"
                    >
                      <path d={path} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Metamorfosis Lab. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
