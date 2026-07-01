-- Repair orders wrongly marked shipped when only the label was printed.
-- Run once after deploying the Shippo webhook fix.

update public.orders
set status = 'confirmed'
where status = 'shipped'
  and pickup_status = 'unscheduled'
  and shippo_transaction_id is not null;
