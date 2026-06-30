import type { CaseStatus } from "@/lib/cases/types"

/** Case statuses where messaging is permanently disabled. */
export const RESOLVED_CASE_STATUSES: CaseStatus[] = [
  "approved",
  "rejected",
  "closed",
  "fraud",
]

export interface CaseMessagingState {
  status: CaseStatus
  chat_closed_at?: string | null
}

/** True when the case thread cannot accept new messages. */
export function isCaseMessagingLocked(caseData: CaseMessagingState): boolean {
  if (RESOLVED_CASE_STATUSES.includes(caseData.status)) return true
  return Boolean(caseData.chat_closed_at)
}

export function messagingLockedMessage(caseData: CaseMessagingState): string {
  if (RESOLVED_CASE_STATUSES.includes(caseData.status)) {
    return "This case is resolved — messaging is disabled."
  }
  if (caseData.chat_closed_at) {
    return "This conversation has been closed by support."
  }
  return ""
}
