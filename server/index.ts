import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({ apiKey });

const FALLBACK_MESSAGE = 'No information found for this barcode.';

app.post('/api/search', async (req, res) => {
  try {
    const { barcode, language } = req.body;
    if (!barcode) {
      res.status(400).json({ error: 'Barcode is required' });
      return;
    }

    const langInstruction = language && language !== 'en'
      ? `Respond entirely in the language with code "${language}". Use that language for all text.`
      : '';

    const prompt = `A product was scanned with barcode: ${barcode}. Search Google to identify what product this barcode belongs to. Provide concise, helpful documentation about the product: what it is, its common uses, manufacturer, and any relevant details. ${langInstruction}. If you cannot identify the product, say "${FALLBACK_MESSAGE}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
    });

    const text = response.text || FALLBACK_MESSAGE;
    res.json({ text });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', detail: error?.message });
  }
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const langCode = language || 'en';
    const voiceName = getVoiceForLanguage(langCode);

    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: langCode, name: voiceName },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0 },
        }),
      }
    );

    if (!ttsRes.ok) {
      const errBody = await ttsRes.text();
      console.error('TTS API error:', ttsRes.status, errBody);
      res.status(ttsRes.status).json({ error: 'TTS synthesis failed' });
      return;
    }

    const data = await ttsRes.json();
    res.json({ audioContent: data.audioContent });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'TTS failed', detail: error?.message });
  }
});

function getVoiceForLanguage(lang: string): string {
  if (lang === 'nl-BE') return 'nl-BE-Wavenet-A';
  const base = lang.split('-')[0];
  const voiceMap: Record<string, string> = {
    en: 'en-US-Neural2-J',
    es: 'es-ES-Neural2-A',
    fr: 'fr-FR-Neural2-A',
    de: 'de-DE-Neural2-A',
    it: 'it-IT-Neural2-A',
    pt: 'pt-BR-Neural2-A',
    ru: 'ru-RU-Neural2-A',
    ja: 'ja-JP-Neural2-A',
    ko: 'ko-KR-Neural2-A',
    zh: 'zh-CN-Neural2-A',
    ar: 'ar-X-Neural2-A',
    hi: 'hi-IN-Neural2-A',
    nl: 'nl-NL-Neural2-A',
    pl: 'pl-PL-Neural2-A',
    tr: 'tr-TR-Neural2-A',
    sv: 'sv-SE-Neural2-A',
    da: 'da-DK-Neural2-A',
    fi: 'fi-FI-Neural2-A',
    nb: 'nb-NO-Neural2-A',
    cs: 'cs-CZ-Neural2-A',
    ro: 'ro-RO-Neural2-A',
    vi: 'vi-VN-Neural2-A',
    th: 'th-TH-Neural2-A',
  };
  return voiceMap[base] || 'en-US-Neural2-J';
}

if (isProduction) {
  const distPath = join(__dirname, '..', 'dist');
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = join(distPath, 'index.html');
      if (existsSync(indexPath)) {
        res.set('Content-Type', 'text/html');
        res.send(readFileSync(indexPath, 'utf-8'));
      } else {
        res.status(404).send('Not found');
      }
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
});
