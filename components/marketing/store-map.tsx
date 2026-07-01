"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

import { PICKUP_ADDRESS } from "@/lib/checkout/pickup"

const STORE_COORDS = { lat: 34.0634, lng: -117.6509 }
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

interface StoreMapProps {
  className?: string
}

declare global {
  interface Window {
    google?: typeof google
    initStoreMap?: () => void
  }
}

/** Interactive Google Map with greedy gestures (no two-finger overlay). */
export function StoreMap({ className }: StoreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!MAPS_API_KEY || !containerRef.current) return

    let cancelled = false

    function init() {
      if (cancelled || !containerRef.current || !window.google?.maps) return

      const map = new window.google.maps.Map(containerRef.current, {
        center: STORE_COORDS,
        zoom: 16,
        gestureHandling: "greedy",
        disableDefaultUI: false,
        clickableIcons: false,
      })

      new window.google.maps.Marker({
        map,
        position: STORE_COORDS,
        title: "Metamorfosis LLC",
      })
    }

    const scriptId = "google-maps-js"
    const existing = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null

    if (window.google?.maps) {
      init()
      return () => {
        cancelled = true
      }
    }

    if (existing) {
      existing.addEventListener("load", init)
      return () => {
        cancelled = true
        existing.removeEventListener("load", init)
      }
    }

    window.initStoreMap = init
    const script = document.createElement("script")
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&callback=initStoreMap`
    script.async = true
    script.defer = true
    script.onerror = () => setFailed(true)
    document.head.appendChild(script)

    return () => {
      cancelled = true
      delete window.initStoreMap
    }
  }, [])

  if (!MAPS_API_KEY || failed) {
    return (
      <div
        className={`border-border bg-muted/20 flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-3 rounded-3xl border lg:min-h-[460px] ${className ?? ""}`}
      >
        <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full shadow-md">
          <MapPin className="h-6 w-6" strokeWidth={2} />
        </div>
        <div className="text-center">
          <p className="text-foreground text-sm font-semibold">
            Metamorfosis LLC
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {PICKUP_ADDRESS}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`h-full min-h-[360px] w-full lg:min-h-[460px] ${className ?? ""}`}
      aria-label="Store location map"
    />
  )
}
