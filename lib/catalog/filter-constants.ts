/** Parent → child category hierarchy shown in the catalog filter panel. */
export const CATEGORY_TREE: { parent: string; children: string[] }[] = [
  {
    parent: "Hair Care",
    children: [
      "Shampoos",
      "Conditioners",
      "Hair Masks",
      "Intensive Treatments",
      "Oils & Serums",
    ],
  },
  {
    parent: "Hair Color",
    children: [
      "Permanent Color",
      "Semi & Demi-Permanent Color",
      "Developers & Peroxides",
      "Bleaches & Lighteners",
      "Color Tools & Accessories",
    ],
  },
  {
    parent: "Hair Styling",
    children: [
      "Gels & Waxes",
      "Hairsprays & Fixatives",
      "Styling Creams",
      "Heat Protectants",
      "Styling Tools",
    ],
  },
  {
    parent: "Nails",
    children: [
      "Acrylics & Monomers",
      "Gel & Nail Polish",
      "Primers, Base & Top Coats",
      "Treatments & Removers",
      "Nail Tips & Extensions",
      "Tools & Equipment",
      "Salon Disposables & Practice",
    ],
  },
  {
    parent: "Makeup",
    children: ["Face", "Eyes & Brows", "Lips", "Brushes & Tools"],
  },
  {
    parent: "Lashes",
    children: ["Eyelash Extensions", "Adhesives & Tools"],
  },
  {
    parent: "Barber & Men's Grooming",
    children: [
      "Hair & Beard Styling",
      "Shaving & Beard Care",
      "Clippers, Trimmers & Blades",
      "Barber Accessories & Apparel",
    ],
  },
  {
    parent: "Personal Care & Fragrances",
    children: ["Fragrances"],
  },
]

/** Fixed maximum for the price slider — $200, regardless of catalog data. */
export const MAX_PRICE_CENTS = 20_000
