-- Add multi-image support on product_translations (Square ITEM imageIds[])
alter table public.product_translations
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

comment on column public.product_translations.image_urls is
  'All Square ITEM image CDN URLs (ordered). image_url remains the primary/first image.';
