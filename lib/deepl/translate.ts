import "server-only"

import * as deepl from "deepl-node"

let _translator: deepl.Translator | null = null

function getTranslator(): deepl.Translator | null {
  const key = process.env.DEEPL_API_KEY
  if (!key) return null
  if (!_translator) _translator = new deepl.Translator(key)
  return _translator
}

export interface TranslatedText {
  nameEs: string
  descriptionEs: string
}

/**
 * Translate product name and description from English to Spanish.
 * Only called during catalog sync when EN text has changed — never on read.
 * Falls back to copying EN text when DEEPL_API_KEY is not configured (dev-safe).
 */
export async function translateProductText(
  nameEn: string,
  descriptionEn: string,
): Promise<TranslatedText> {
  const translator = getTranslator()

  if (!translator) {
    console.warn(
      "[DeepL] DEEPL_API_KEY not set — copying EN text as ES fallback",
    )
    return { nameEs: nameEn, descriptionEs: descriptionEn }
  }

  try {
    const [nameResult, descResult] = await Promise.all([
      translator.translateText(nameEn, "en", "es"),
      translator.translateText(descriptionEn, "en", "es"),
    ])
    return {
      nameEs: nameResult.text,
      descriptionEs: descResult.text,
    }
  } catch (err) {
    console.error("[DeepL] Translation error:", err)
    return { nameEs: nameEn, descriptionEs: descriptionEn }
  }
}
