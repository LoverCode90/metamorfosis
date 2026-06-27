import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-2.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-muted text-muted-foreground",
        outline: "border-border text-foreground",
        ghost: "border-transparent hover:bg-muted text-muted-foreground",
        /** Professional verified — emerald */
        success: "border-transparent bg-accent-emerald/15 text-accent-emerald",
        /** Warning / pending — amber */
        warning: "border-transparent bg-accent-amber/15 text-accent-amber",
        /** Destructive / rejected — rose */
        destructive: "border-transparent bg-accent-rose/15 text-accent-rose",
        /** Warm neutral badge (sand) */
        sand: "border-transparent bg-accent-sand/20 text-accent-sand",
        /** Brand / premium indicator — violet */
        violet: "border-transparent bg-accent-violet/15 text-accent-violet",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      { className: cn(badgeVariants({ variant }), className) },
      props,
    ),
    render,
    state: { slot: "badge", variant },
  })
}

export { Badge, badgeVariants }
