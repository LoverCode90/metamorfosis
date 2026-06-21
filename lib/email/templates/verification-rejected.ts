export interface VerificationRejectedData {
  to: string
  name: string
  reason: string
}

export function buildVerificationRejectedHtml(
  data: VerificationRejectedData,
): string {
  const reuploadUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://metamorfosisbeauty.com"}/verify`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Unsuccessful</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a22;border-radius:12px;overflow:hidden;border:1px solid #2e2e3a;">
          <tr>
            <td style="padding:32px 40px;border-bottom:1px solid #2e2e3a;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#f5f5f7;letter-spacing:-0.5px;">Metamorfosis Beauty</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f5f5f7;">Verification unsuccessful</p>
              <p style="margin:0 0 24px;font-size:14px;color:#8b8b9a;line-height:1.6;">
                Hi ${data.name}, we were unable to verify your professional license at this time.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f0f0f;border-radius:8px;border:1px solid #3a1a1a;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#f87171;">Reason</p>
                    <p style="margin:0;font-size:13px;color:#fca5a5;line-height:1.6;">${data.reason}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;color:#8b8b9a;line-height:1.6;">
                You can re-upload your document at any time. Make sure the image is well-lit, in focus, and shows all four corners of the license.
              </p>
              <a href="${reuploadUrl}"
                 style="display:inline-block;background:#f5f5f7;color:#0f0f13;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Re-upload document
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2e2e3a;">
              <p style="margin:0;font-size:12px;color:#52525e;">
                Metamorfosis Beauty Supply · Ontario, CA
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

export function buildVerificationRejectedText(
  data: VerificationRejectedData,
): string {
  const reuploadUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://metamorfosisbeauty.com"}/verify`

  return `Hi ${data.name},

We were unable to verify your professional license at this time.

Reason: ${data.reason}

You can re-upload your document here: ${reuploadUrl}

Make sure the image is well-lit, in focus, and shows all four corners of the license.

— Metamorfosis Beauty Supply`
}
