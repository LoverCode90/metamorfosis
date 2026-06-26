/**
 * Posts a message to a support case thread. Throws with the server message on
 * failure.
 * @param caseId - The case to append to.
 * @param message - Trimmed message body.
 */
export async function sendCaseMessage(
  caseId: string,
  message: string,
): Promise<void> {
  const res = await fetch(`/api/profile/cases/${caseId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Failed to send message")
  }
}
