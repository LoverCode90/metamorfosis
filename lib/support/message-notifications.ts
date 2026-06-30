const STORAGE_KEY = "notified-support-message-ids"

function readNotifiedIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function writeNotifiedIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

/** Whether the customer has already been notified about this support message. */
export function hasBeenNotifiedForMessage(messageId: string): boolean {
  return readNotifiedIds().has(messageId)
}

/** Persist that the customer was notified (or dismissed) for this message. */
export function markMessageNotified(messageId: string): void {
  const ids = readNotifiedIds()
  ids.add(messageId)
  writeNotifiedIds(ids)
}

/** Mark all messages in a case thread as seen so no toast fires for them. */
export function markCaseMessagesNotified(messageIds: string[]): void {
  if (messageIds.length === 0) return
  const ids = readNotifiedIds()
  for (const messageId of messageIds) {
    ids.add(messageId)
  }
  writeNotifiedIds(ids)
}
