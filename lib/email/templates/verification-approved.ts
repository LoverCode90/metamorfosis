export interface VerificationApprovedData {
  to: string
  name: string
}

export function buildVerificationApprovedHtml(
  data: VerificationApprovedData,
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>License Verified</title>
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
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f5f5f7;">Your license is verified ✓</p>
              <p style="margin:0 0 24px;font-size:14px;color:#8b8b9a;line-height:1.6;">
                Hi ${data.name}, your professional status has been confirmed.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d2318;border-radius:8px;border:1px solid #1a4a2e;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#4ade80;">Professional access unlocked</p>
                    <p style="margin:0;font-size:13px;color:#6ee7a0;line-height:1.6;">
                      You now have access to professional-only products and the $2.00 per-item discount on all color formulas.
                    </p>
                  </td>
                </tr>
              </table>
              <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://metamorfosisbeauty.com"}/products"
                 style="display:inline-block;background:#f5f5f7;color:#0f0f13;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Shop professional products
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

export function buildVerificationApprovedText(
  data: VerificationApprovedData,
): string {
  return `Hi ${data.name},

Your professional license has been verified.

You now have access to professional-only products and the $2.00 per-item discount on all color formulas.

Shop now: ${process.env.NEXT_PUBLIC_APP_URL ?? "https://metamorfosisbeauty.com"}/products

— Metamorfosis Beauty Supply`
}
