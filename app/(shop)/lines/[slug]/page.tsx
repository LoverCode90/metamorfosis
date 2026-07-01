import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  BRAND_LINE_SLUGS,
  getBrandLineBySlug,
} from "@/lib/marketing/brand-lines"

interface LinePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return BRAND_LINE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: LinePageProps): Promise<Metadata> {
  const { slug } = await params
  const line = getBrandLineBySlug(slug)
  if (!line) return { title: "Line not found" }
  return { title: line.name }
}

export default async function LinePage({ params }: LinePageProps) {
  const { slug } = await params
  const line = getBrandLineBySlug(slug)
  if (!line) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{line.name}</h1>
    </div>
  )
}
