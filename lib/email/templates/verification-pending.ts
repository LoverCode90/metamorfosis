export interface VerificationPendingData {
  to: string
  name: string
}

export function buildVerificationPendingHtml(
  data: VerificationPendingData,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document Under Review</title>
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
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f5f5f7;">Document under review</p>
              <p style="margin:0 0 24px;font-size:14px;color:#8b8b9a;line-height:1.6;">
                Hi ${data.name}, we received your professional license document and our team is reviewing it.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#23232e;border-radius:8px;border:1px solid #2e2e3a;margin:0 0 24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:13px;color:#8b8b9a;line-height:1.6;">
                      Most submissions are reviewed within <strong style="color:#f5f5f7;">1 business day</strong>.
                      You will receive an email as soon as your professional status is confirmed.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;font-size:13px;color:#8b8b9a;line-height:1.6;">
                If you have any questions, reply to this email and we'll be happy to help.
              </p>
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

export function buildVerificationPendingText(
  data: VerificationPendingData,
): string {
  return `Hi ${data.name},

We received your professional license document and our team is reviewing it.

Most submissions are reviewed within 1 business day. You'll receive an email as soon as your professional status is confirmed.

If you have questions, reply to this email.

— Metamorfosis Beauty Supply`
}
