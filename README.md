<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Eburon AI Barcode Reader

A full-stack barcode scanner powered by Gemini AI that identifies products, searches the web for information, and reads results aloud in your chosen language.

## Features

- **Full-Stack Architecture**: Secure Express + Vite server-side architecture that safely handles Gemini web searches and text-to-speech calls without exposing API credentials.

- **Automated Web Search**: Upon a successful barcode capture, the app automatically runs a Google Search (via Gemini 2.0 Flash) to look up what the product is and returns concise, helpful documentation about it.

- **Loading State & Data Render**: An intuitive loader ("Searching Google...") displays inside the result modal while querying. Once generated, the text is cleanly formatted using React Markdown.

- **Automatic Read Aloud (TTS)**: As soon as the retrieved text is rendered, it initiates a call to Gemini's Text-To-Speech engine using the native "Orus" voice and automatically plays the audio back to the user upon completion.

- **Language Dropdown Settings**: A clean language dropdown selector mapped to over 100 global languages within the top header. Selecting a language ensures both the Google Search result context and consecutive TTS read-aloud playback are formatted natively in that selected language.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
