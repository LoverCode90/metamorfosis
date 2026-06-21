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
  <title>Welcome to Metamorfosis Beauty / ¡Te damos la bienvenida!</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a22;border-radius:16px;overflow:hidden;border:1px solid #2e2e3a;box-shadow:0 8px 30px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);padding:40px;text-align:center;border-bottom:1px solid #2e2e3a;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Metamorfosis Beauty</p>
              <p style="margin:8px 0 0;font-size:14px;color:#c7d2fe;letter-spacing:0.5px;">PREMIUM BEAUTY SUPPLY</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding:40px 32px 32px 32px;">
              <!-- Welcome Heading -->
              <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#f5f5f7;text-align:center;">
                Welcome, ${data.name}! 👋 <br/>
                <span style="font-size:18px;color:#a1a1aa;font-weight:500;">¡Te damos la bienvenida!</span>
              </p>
              
              <!-- Core Context Intro (Bilingual) -->
              <div style="margin-bottom:32px;border-bottom:1px solid #2e2e3a;padding-bottom:24px;">
                <!-- English -->
                <p style="margin:0 0 16px;font-size:14px;color:#d4d4d8;line-height:1.7;">
                  We are thrilled to welcome you to <strong>Metamorfosis Beauty Supply</strong>. Located in Ontario, CA, we are your premium hybrid store for professional salon-quality color, care, tools, and accessories. Whether you are a beauty lover shopping for personal care or a salon professional, we've got you covered.
                </p>
                <!-- Spanish -->
                <p style="margin:0;font-size:14px;color:#a1a1aa;line-height:1.7;font-style:italic;">
                  Nos emociona darte la bienvenida a <strong>Metamorfosis Beauty Supply</strong>. Ubicados en Ontario, CA, somos tu tienda premium híbrida para tintes profesionales, cuidado del cabello, herramientas y accesorios de calidad de salón. Ya seas amante de la belleza comprando para tu cuidado personal o profesional de salón, tenemos todo lo que necesitas.
                </p>
              </div>

              <!-- Next Steps Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <div style="background:#23232e;border-radius:10px;border:1px solid #2e2e3a;padding:20px;">
                      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#f5f5f7;">
                        🛍️ Retail Shopping / Compras al Por Menor
                      </p>
                      <p style="margin:0 0 8px;font-size:13px;color:#d4d4d8;line-height:1.6;">
                        Explore our professional catalog, save items to your wishlist, and purchase standard salon-quality products instantly.
                      </p>
                      <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;font-style:italic;">
                        Explora nuestro catálogo profesional, guarda artículos en tu lista de deseos y compra productos de salón estándar al instante.
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <div style="background:#23232e;border-radius:10px;border:1px solid #2e2e3a;padding:20px;">
                      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#818cf8;">
                        💼 Salon Professionals & Students / Profesionales y Estudiantes
                      </p>
                      <p style="margin:0 0 8px;font-size:13px;color:#d4d4d8;line-height:1.6;">
                        Are you a licensed cosmetologist, barber, esthetician, or student? Upload your credentials under your profile verification hub to unlock restricted professional-grade products and get <strong>$2 off</strong> all color lines.
                      </p>
                      <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;font-style:italic;">
                        ¿Eres un estilista, barbero, esteticista con licencia o estudiante? Sube tus credenciales en la sección de verificación de tu perfil para desbloquear productos profesionales y obtener <strong>$2 de descuento</strong> en todas las líneas de tinte.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${shopUrl}"
                       style="display:inline-block;background:#ffffff;color:#0f0f13;font-size:14px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;box-shadow:0 4px 12px rgba(255,255,255,0.1);">
                      Start Shopping / Ir a la Tienda
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:32px;background:#13131a;border-top:1px solid #2e2e3a;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#71717a;">
                Metamorfosis Beauty Supply &middot; Ontario, CA
              </p>
              <p style="margin:0;font-size:12px;color:#52525b;">
                Need help? Reply directly to this email or visit our store.<br/>
                ¿Necesitas ayuda? Responde directamente a este correo o visítanos.
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
¡Te damos la bienvenida a Metamorfosis Beauty Supply!

[English]
Located in Ontario, CA, we are your premium hybrid source for professional salon-quality color, care, and tools.
Whether you're shopping for personal care or you're a salon professional, we've got you covered.

What's Next?
- Browse our catalog & start shopping: ${shopUrl}
- Save favorites to your wishlist.
- Salon Pros & Students: Upload your license/credentials in your Profile to unlock restricted pro products and get $2 off color lines.

[Español]
Ubicados en Ontario, CA, somos tu tienda premium híbrida para tintes profesionales, cuidado del cabello y herramientas de salón.
Ya sea para uso personal o para uso profesional en tu salón, tenemos lo necesario.

¿Qué sigue?
- Explora nuestro catálogo y compra: ${shopUrl}
- Guarda tus artículos preferidos en la lista de deseos.
- Profesionales y Estudiantes: Sube tus credenciales en tu Perfil para desbloquear productos profesionales y obtener $2 de descuento en tintes.

If you have any questions, simply reply to this email.
Si tienes preguntas, solo responde a este correo.

— Metamorfosis Beauty Supply`
}
