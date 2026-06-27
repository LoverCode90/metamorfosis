export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://metamorfosisbeauty.com"

/** Wraps body HTML in the shared Metamorfosis dark email shell. */
export function emailShell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a22;border-radius:12px;overflow:hidden;border:1px solid #2e2e3a;">
        <tr><td style="padding:32px 40px;border-bottom:1px solid #2e2e3a;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#f5f5f7;letter-spacing:-0.5px;">Metamorfosis Beauty</p>
        </td></tr>
        <tr><td style="padding:40px;">${bodyHtml}</td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid #2e2e3a;">
          <p style="margin:0;font-size:12px;color:#52525e;">Metamorfosis Beauty Supply · Ontario, CA</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim()
}

/** A standard heading + lead paragraph block for the email body. */
export function emailIntro(heading: string, lead: string): string {
  return `
<p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f5f5f7;">${heading}</p>
<p style="margin:0 0 24px;font-size:14px;color:#8b8b9a;line-height:1.6;">${lead}</p>`
}
