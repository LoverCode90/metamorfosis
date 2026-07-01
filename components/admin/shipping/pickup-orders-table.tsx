import type { PickupOrderRow } from "@/lib/admin/carrier-pickup-types"
import {
  ADMIN_TABLE_HEAD_CLASS,
  ADMIN_TABLE_SHELL_CLASS,
} from "@/lib/admin/card-styles"
import { PickupTableRow } from "@/components/admin/shipping/pickup-table-row"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PickupOrdersTableProps {
  rows: PickupOrderRow[]
  selectable?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  onToggleAll?: (checked: boolean) => void
  emptyMessage?: string
}

export function PickupOrdersTable({
  rows,
  selectable = false,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleAll,
  emptyMessage = "No packages found.",
}: PickupOrdersTableProps) {
  const allSelected =
    rows.length > 0 && rows.every((r) => selectedIds.has(r.id))

  if (rows.length === 0) {
    return (
      <div
        className={`${ADMIN_TABLE_SHELL_CLASS} text-muted-foreground px-5 py-16 text-center text-sm`}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={ADMIN_TABLE_SHELL_CLASS}>
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            {selectable && (
              <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 w-10 px-4`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleAll?.(e.target.checked)}
                  className="size-4 cursor-pointer rounded border accent-violet-600"
                  aria-label="Select all"
                />
              </TableHead>
            )}
            <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
              Recipient
            </TableHead>
            <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
              Label printed
            </TableHead>
            <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
              Carrier
            </TableHead>
            <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
              Service
            </TableHead>
            <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
              Total
            </TableHead>
            <TableHead className={`${ADMIN_TABLE_HEAD_CLASS} h-11 px-5`}>
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <PickupTableRow
              key={row.id}
              row={row}
              selectable={selectable}
              selected={selectedIds.has(row.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
