export interface WelcomeData {
  to: string
  name: string
}

export function buildWelcomeHtml(data: WelcomeData): string {
  const shopUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://metamorfosisllc.com"}/products`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Metamorfosis Beauty</title>
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
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f5f5f7;">Welcome, ${data.name} 👋</p>
              <p style="margin:0 0 24px;font-size:14px;color:#8b8b9a;line-height:1.6;">
                Your account is ready. We're glad you're here — Metamorfosis Beauty is your professional source for salon-quality color, care, and tools.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#23232e;border-radius:8px;border:1px solid #2e2e3a;margin:0 0 28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#f5f5f7;">What's next?</p>
                    <p style="margin:0;font-size:13px;color:#8b8b9a;line-height:1.6;">
                      Browse our catalog, save favorites to your wishlist, and if you're a licensed professional or student, upload your license to unlock pro pricing.
                    </p>
                  </td>
                </tr>
              </table>
              <a href="${shopUrl}"
                 style="display:inline-block;background:#f5f5f7;color:#0f0f13;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
                Start shopping
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2e2e3a;">
              <p style="margin:0;font-size:12px;color:#52525e;">
                Metamorfosis Beauty Supply · Ontario, CA · Reply to this email for support.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildWelcomeText(data: WelcomeData): string {
  const shopUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://metamorfosisllc.com"}/products`

  return `Welcome to Metamorfosis Beauty, ${data.name}!

Your account is ready.

We're your professional source for salon-quality color, care, and tools.

Browse our catalog and start shopping:
${shopUrl}

If you're a licensed professional or student, upload your license to unlock pro pricing.

Reply to this email if you need help.

— Metamorfosis Beauty Supply`
}
