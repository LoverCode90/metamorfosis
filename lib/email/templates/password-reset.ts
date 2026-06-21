export interface PasswordResetData {
  to: string
  name: string
  resetUrl: string
  expiresInMinutes: number
}

export function buildPasswordResetHtml(data: PasswordResetData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
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
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#f5f5f7;">Reset your password</p>
              <p style="margin:0 0 32px;font-size:14px;color:#8b8b9a;line-height:1.6;">
                Hi ${data.name}, we received a request to reset your password. Click the button below to choose a new one.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${data.resetUrl}" style="display:inline-block;background:#f5f5f7;color:#0f0f13;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;">
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#8b8b9a;line-height:1.6;">
                This link expires in <strong style="color:#f5f5f7;">${data.expiresInMinutes} minutes</strong>.
              </p>
              <p style="margin:0;font-size:13px;color:#52525e;line-height:1.6;">
                If you didn't request this, you can safely ignore this email — your password won't change.
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
</html>`
}

export function buildPasswordResetText(data: PasswordResetData): string {
  return `Hi ${data.name},

We received a request to reset your Metamorfosis Beauty password.

Reset it here:
  ${data.resetUrl}

This link expires in ${data.expiresInMinutes} minutes.

If you didn't request this, you can safely ignore this email — your password won't change.

— Metamorfosis Beauty Supply`
}
