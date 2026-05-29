import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { ScanBarcode, Camera, Play, Square, CheckCircle2, Copy, Globe, Volume2, Loader2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LANGUAGES = [
  { code: 'nl-BE', name: 'Flemish (Vlaams)' },
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' }, { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }, { code: 'bn', name: 'Bengali' },
  { code: 'pa', name: 'Punjabi' }, { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' }, { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' }, { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' }, { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' }, { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' }, { code: 'tr', name: 'Turkish' },
  { code: 'sv', name: 'Swedish' }, { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' }, { code: 'nb', name: 'Norwegian Bokmal' },
  { code: 'nn', name: 'Norwegian Nynorsk' }, { code: 'cs', name: 'Czech' },
  { code: 'ro', name: 'Romanian' }, { code: 'hu', name: 'Hungarian' },
  { code: 'el', name: 'Greek' }, { code: 'he', name: 'Hebrew' },
  { code: 'id', name: 'Indonesian' }, { code: 'ms', name: 'Malay' },
  { code: 'tl', name: 'Filipino' }, { code: 'uk', name: 'Ukrainian' },
  { code: 'bg', name: 'Bulgarian' }, { code: 'sr', name: 'Serbian' },
  { code: 'hr', name: 'Croatian' }, { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' }, { code: 'lt', name: 'Lithuanian' },
  { code: 'lv', name: 'Latvian' }, { code: 'et', name: 'Estonian' },
  { code: 'is', name: 'Icelandic' }, { code: 'mt', name: 'Maltese' },
  { code: 'ga', name: 'Irish' }, { code: 'cy', name: 'Welsh' },
  { code: 'sq', name: 'Albanian' }, { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' }, { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' }, { code: 'bs', name: 'Bosnian' },
  { code: 'ca', name: 'Catalan' }, { code: 'ceb', name: 'Cebuano' },
  { code: 'co', name: 'Corsican' }, { code: 'eo', name: 'Esperanto' },
  { code: 'gl', name: 'Galician' }, { code: 'ka', name: 'Georgian' },
  { code: 'ha', name: 'Hausa' }, { code: 'haw', name: 'Hawaiian' },
  { code: 'hmn', name: 'Hmong' }, { code: 'ig', name: 'Igbo' },
  { code: 'jw', name: 'Javanese' }, { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' }, { code: 'rw', name: 'Kinyarwanda' },
  { code: 'ku', name: 'Kurdish (Kurmanji)' }, { code: 'ckb', name: 'Kurdish (Sorani)' },
  { code: 'ky', name: 'Kyrgyz' }, { code: 'lo', name: 'Lao' },
  { code: 'la', name: 'Latin' }, { code: 'lb', name: 'Luxembourgish' },
  { code: 'mk', name: 'Macedonian' }, { code: 'mg', name: 'Malagasy' },
  { code: 'mi', name: 'Maori' }, { code: 'mn', name: 'Mongolian' },
  { code: 'my', name: 'Myanmar (Burmese)' }, { code: 'ne', name: 'Nepali' },
  { code: 'ny', name: 'Nyanja (Chichewa)' }, { code: 'or', name: 'Odia (Oriya)' },
  { code: 'ps', name: 'Pashto' }, { code: 'fa', name: 'Persian' },
  { code: 'sd', name: 'Sindhi' }, { code: 'si', name: 'Sinhala' },
  { code: 'so', name: 'Somali' }, { code: 'st', name: 'Sesotho' },
  { code: 'su', name: 'Sundanese' }, { code: 'sw', name: 'Swahili' },
  { code: 'tg', name: 'Tajik' }, { code: 'tk', name: 'Turkmen' },
  { code: 'ug', name: 'Uyghur' }, { code: 'ur', name: 'Urdu' },
  { code: 'uz', name: 'Uzbek' }, { code: 'xh', name: 'Xhosa' },
  { code: 'yi', name: 'Yiddish' }, { code: 'yo', name: 'Yoruba' },
  { code: 'zu', name: 'Zulu' }, { code: 'am', name: 'Amharic' },
  { code: 'fy', name: 'Frisian' }, { code: 'gd', name: 'Scots Gaelic' },
  { code: 'ht', name: 'Haitian Creole' }, { code: 'ln', name: 'Lingala' },
  { code: 'sm', name: 'Samoan' }, { code: 'sn', name: 'Shona' },
  { code: 'tt', name: 'Tatar' }, { code: 'wo', name: 'Wolof' },
  { code: 'af', name: 'Afrikaans' }, { code: 'ak', name: 'Akan' },
  { code: 'an', name: 'Aragonese' }, { code: 'as', name: 'Assamese' },
  { code: 'av', name: 'Avaric' }, { code: 'ae', name: 'Avestan' },
  { code: 'ay', name: 'Aymara' }, { code: 'ba', name: 'Bashkir' },
  { code: 'bm', name: 'Bambara' }, { code: 'bi', name: 'Bislama' },
  { code: 'bo', name: 'Tibetan' }, { code: 'br', name: 'Breton' },
  { code: 'ce', name: 'Chechen' }, { code: 'ch', name: 'Chamorro' },
  { code: 'chr', name: 'Cherokee' }, { code: 'cr', name: 'Cree' },
  { code: 'cu', name: 'Church Slavonic' }, { code: 'cv', name: 'Chuvash' },
  { code: 'dv', name: 'Divehi (Maldivian)' }, { code: 'dz', name: 'Dzongkha' },
  { code: 'ee', name: 'Ewe' }, { code: 'ff', name: 'Fulah' },
  { code: 'fj', name: 'Fijian' }, { code: 'fo', name: 'Faroese' },
  { code: 'gn', name: 'Guarani' }, { code: 'gv', name: 'Manx' },
  { code: 'hz', name: 'Herero' }, { code: 'ia', name: 'Interlingua' },
  { code: 'ie', name: 'Interlingue' }, { code: 'ii', name: 'Nuosu (Sichuan Yi)' },
  { code: 'ik', name: 'Inupiaq' }, { code: 'io', name: 'Ido' },
  { code: 'iu', name: 'Inuktitut' }, { code: 'jv', name: 'Javanese' },
  { code: 'kg', name: 'Kongo' }, { code: 'ki', name: 'Kikuyu' },
  { code: 'kj', name: 'Kuanyama' }, { code: 'kr', name: 'Kanuri' },
  { code: 'ks', name: 'Kashmiri' }, { code: 'kv', name: 'Komi' },
  { code: 'kw', name: 'Cornish' }, { code: 'lg', name: 'Ganda' },
  { code: 'li', name: 'Limburgish' }, { code: 'lu', name: 'Luba-Katanga' },
  { code: 'mh', name: 'Marshallese' },
  { code: 'na', name: 'Nauruan' }, { code: 'nd', name: 'North Ndebele' },
  { code: 'ng', name: 'Ndonga' }, { code: 'nv', name: 'Navajo' },
  { code: 'oc', name: 'Occitan' }, { code: 'oj', name: 'Ojibwe' },
  { code: 'om', name: 'Oromo' }, { code: 'os', name: 'Ossetian' },
  { code: 'pi', name: 'Pali' }, { code: 'qu', name: 'Quechua' },
  { code: 'rm', name: 'Romansh' }, { code: 'rn', name: 'Kirundi' },
  { code: 'sa', name: 'Sanskrit' }, { code: 'sc', name: 'Sardinian' },
  { code: 'sg', name: 'Sango' }, { code: 'sh', name: 'Serbo-Croatian' },
  { code: 'ss', name: 'Swati' }, { code: 'ti', name: 'Tigrinya' },
  { code: 'tn', name: 'Tswana' }, { code: 'to', name: 'Tongan' },
  { code: 'ts', name: 'Tsonga' }, { code: 'tw', name: 'Twi' },
  { code: 'ty', name: 'Tahitian' }, { code: 've', name: 'Venda' },
  { code: 'vo', name: 'Volapuk' }, { code: 'wa', name: 'Walloon' },
  { code: 'za', name: 'Zhuang' }, { code: 'ab', name: 'Abkhazian' },
  { code: 'aa', name: 'Afar' }, { code: 'ady', name: 'Adyghe' },
  { code: 'als', name: 'Alemannic' }, { code: 'ang', name: 'Old English' },
  { code: 'arc', name: 'Aramaic' }, { code: 'ast', name: 'Asturian' },
  { code: 'ban', name: 'Balinese' }, { code: 'bar', name: 'Bavarian' },
  { code: 'bho', name: 'Bhojpuri' }, { code: 'bpy', name: 'Bishnupriya Manipuri' },
  { code: 'bug', name: 'Buginese' }, { code: 'bxr', name: 'Buryat' },
  { code: 'cho', name: 'Choctaw' }, { code: 'chy', name: 'Cheyenne' },
  { code: 'diq', name: 'Dimli (Zazaki)' }, { code: 'dsb', name: 'Lower Sorbian' },
  { code: 'ext', name: 'Extremaduran' }, { code: 'frp', name: 'Arpitan' },
  { code: 'fur', name: 'Friulian' }, { code: 'gag', name: 'Gagauz' },
  { code: 'got', name: 'Gothic' }, { code: 'hsb', name: 'Upper Sorbian' },
  { code: 'ilo', name: 'Ilocano' }, { code: 'jam', name: 'Jamaican Creole' },
  { code: 'kab', name: 'Kabyle' }, { code: 'ksh', name: 'Koln (Ripuarian)' },
  { code: 'lad', name: 'Ladino' }, { code: 'lbe', name: 'Lak' },
  { code: 'lez', name: 'Lezghian' }, { code: 'lij', name: 'Ligurian' },
  { code: 'lmo', name: 'Lombard' }, { code: 'mai', name: 'Maithili' },
  { code: 'mdf', name: 'Moksha' }, { code: 'mhr', name: 'Mari' },
  { code: 'mic', name: 'Micmac' }, { code: 'min', name: 'Minangkabau' },
  { code: 'mus', name: 'Creek (Muskogee)' },
  { code: 'mwl', name: 'Mirandese' }, { code: 'myv', name: 'Erzya' },
  { code: 'mzn', name: 'Mazanderani' }, { code: 'nap', name: 'Neapolitan' },
  { code: 'nds', name: 'Low German' }, { code: 'nov', name: 'Novial' },
  { code: 'nrm', name: 'Norman' }, { code: 'pdc', name: 'Pennsylvania Dutch' },
  { code: 'pfl', name: 'Palatine German' }, { code: 'pms', name: 'Piedmontese' },
  { code: 'pnt', name: 'Pontic Greek' }, { code: 'roa-tara', name: 'Tarantino' },
  { code: 'rup', name: 'Aromanian' }, { code: 'sah', name: 'Sakha (Yakut)' },
  { code: 'scn', name: 'Sicilian' }, { code: 'sco', name: 'Scots' },
  { code: 'se', name: 'Northern Sami' }, { code: 'sma', name: 'Southern Sami' },
  { code: 'smj', name: 'Lule Sami' }, { code: 'smn', name: 'Inari Sami' },
  { code: 'srn', name: 'Sranan Tongo' }, { code: 'sro', name: 'Campidanese Sardinian' },
  { code: 'szl', name: 'Silesian' }, { code: 'tcy', name: 'Tulu' },
  { code: 'tet', name: 'Tetum' }, { code: 'tpi', name: 'Tok Pisin' },
  { code: 'tyv', name: 'Tuvan' }, { code: 'udm', name: 'Udmurt' },
  { code: 'vec', name: 'Venetian' }, { code: 'vls', name: 'West Flemish' },
  { code: 'wuu', name: 'Wu Chinese' }, { code: 'xmf', name: 'Mingrelian' },
  { code: 'yue', name: 'Cantonese' }, { code: 'zea', name: 'Zeelandic' },
];

export default function Scanner() {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{ text: string, format: string } | null>(null);
  const [captureTime, setCaptureTime] = useState<string>('');

  const [language, setLanguage] = useState('en');
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasTriggeredSearch = useRef(false);
  const torchEnabledRef = useRef(false);

  useEffect(() => {
    Html5Qrcode.getCameras().then(availableDevices => {
      if (availableDevices && availableDevices.length > 0) {
        setDevices(availableDevices);
        setSelectedCameraId(availableDevices[0].id);
      }
    }).catch(err => {
      console.error("Camera detection error:", err);
    });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (searchResult && !isSearching && hasTriggeredSearch.current) {
      speakText(searchResult, language);
    }
  }, [searchResult, isSearching, language]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio play failure:', e);
    }
  };

  const speakBrowser = (text: string, lang: string) => {
    return new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || 'en';
      utterance.rate = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
      resolve();
    });
  };

  const speakText = async (text: string, lang: string) => {
    try {
      setIsPlaying(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
      });

      if (response.ok) {
        const data = await response.json();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          console.error('Audio playback error');
        };
        await audio.play();
        return;
      }

      throw new Error('Server TTS unavailable');
    } catch {
      console.log('Falling back to browser speech synthesis');
      await speakBrowser(text, lang);
      setIsPlaying(false);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const startScanning = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader");
    }

    const config = {
      fps: 30,
      qrbox: { width: 288, height: 180 },
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.PDF_417,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.RSS_14,
        Html5QrcodeSupportedFormats.RSS_EXPANDED,
        Html5QrcodeSupportedFormats.MAXICODE,
        Html5QrcodeSupportedFormats.AZTEC,
      ],
    };

    try {
      await html5QrCodeRef.current.start(
        selectedCameraId ? selectedCameraId : { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          playBeep();
          stopScanning();
          setScannedResult({
            text: decodedText,
            format: decodedResult.result.format?.formatName || 'Unknown',
          });
          setCaptureTime(`Captured at ${new Date().toLocaleTimeString()}`);
          setSearchResult(null);
          setSearchError(null);
          hasTriggeredSearch.current = true;
          setShowModal(true);
          setIsSearching(true);

          fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: decodedText, language }),
          }).then(res => {
            if (!res.ok) throw new Error('Search failed');
            return res.json();
          }).then(data => {
            setSearchResult(data.text);
          }).catch(e => {
            setSearchError(e.message || 'Search failed');
          }).finally(() => {
            setIsSearching(false);
          });
        },
        () => {}
      );

      setIsScanning(true);

      try {
        const capabilities = html5QrCodeRef.current.getRunningTrackCameraCapabilities();
        const torch = capabilities.torchFeature();
        if (torch.isSupported()) {
          await torch.apply(true);
          torchEnabledRef.current = true;
        }
      } catch (e) {
        console.warn('Torch not available:', e);
      }

      try {
        html5QrCodeRef.current.applyVideoConstraints({ focusMode: 'continuous' });
      } catch (e) {
        console.warn('Continuous focus not available:', e);
      }
    } catch (err) {
      console.error("Failed to start scanning:", err);
      stopScanning();
    }
  };

  const stopScanning = async () => {
    if (torchEnabledRef.current && html5QrCodeRef.current) {
      try {
        const capabilities = html5QrCodeRef.current.getRunningTrackCameraCapabilities();
        const torch = capabilities.torchFeature();
        if (torch.isSupported()) {
          await torch.apply(false);
        }
      } catch (e) {
        console.warn('Failed to turn off torch:', e);
      }
      torchEnabledRef.current = false;
    }
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanning:", err);
      }
    }
    setIsScanning(false);
  };

  const handleToggleScan = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    setScannedResult(null);
    setSearchResult(null);
    setSearchError(null);
    hasTriggeredSearch.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col items-center justify-between font-sans antialiased select-none w-full">
      {/* Header */}
      <header className="w-full max-w-md px-4 py-3 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50 gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <ScanBarcode className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold tracking-wide text-xs uppercase whitespace-nowrap">Scanner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Globe className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="appearance-none bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-6 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer min-w-[100px]"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            <svg className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-400">
            <span className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`}></span>
            <span className={isScanning ? 'text-emerald-400' : 'text-zinc-400'}>{isScanning ? 'Scanning' : 'Standby'}</span>
          </div>
        </div>
      </header>

      {/* Scanner Container */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-4 relative">
        <div className="relative w-full aspect-[3/4] max-h-[500px] bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
          <div id="reader" className="w-full h-full object-cover"></div>

          {/* Overlay Mask */}
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="flex-1 bg-black/60 w-full"></div>
            <div className="flex h-[180px] w-full">
              <div className="flex-1 bg-black/60"></div>
              <div className="w-[288px] h-[180px] relative border border-zinc-700/30">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-md"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-md"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-md"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-md"></div>

                {isScanning && (
                  <>
                    <div className="absolute left-[5%] w-[90%] h-0.5 bg-red-500 shadow-[0_0_12px_2px_rgba(239,68,68,0.8)] animate-laser-sweep"></div>
                    <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-dashed border-blue-500 rounded-full animate-focus-ring"></div>
                  </>
                )}
              </div>
              <div className="flex-1 bg-black/60"></div>
            </div>
            <div className="flex-1 bg-black/60 w-full flex items-start justify-center pt-4">
              <p className="text-xs text-zinc-400 font-medium tracking-wide bg-zinc-900/80 px-3 py-1.5 rounded-full backdrop-blur">
                Align barcode inside the frame
              </p>
            </div>
          </div>

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-center p-6 transition-all duration-300">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-700">
                <Camera className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-base font-semibold text-zinc-200">Camera Access Required</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">Please tap start to grant camera permission and begin scanning barcodes.</p>
            </div>
          )}
        </div>
      </main>

      {/* Controls Panel */}
      <footer className="w-full max-w-md px-6 py-6 border-t border-zinc-900 bg-zinc-950 flex flex-col gap-4 z-40">
        {devices.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Select Input Source</label>
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              disabled={isScanning}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            >
              {devices.map((device, idx) => (
                <option key={device.id} value={device.id}>
                  {device.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="w-full">
          <button
            onClick={handleToggleScan}
            className={`w-full flex items-center justify-center gap-2 py-4 text-white font-semibold rounded-2xl transition-colors shadow-lg text-sm ${
              isScanning
                ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 shadow-red-950/20'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-950/20'
            }`}
          >
            {isScanning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isScanning ? 'Stop Camera' : 'Start Camera'}</span>
          </button>
        </div>
      </footer>

      {/* Result Modal */}
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4 transition-all duration-300 ${showModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden transform transition-transform duration-300 ${showModal ? 'translate-y-0' : 'translate-y-8'}`}>
          {/* Success Header */}
          <div className="bg-emerald-950/40 px-6 py-4 border-b border-zinc-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 shrink-0">
              {isPlaying ? (
                <Volume2 className="w-5 h-5 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                {isSearching ? 'Searching Google...' : isPlaying ? 'Speaking...' : 'Captured Successfully'}
              </h3>
              <p className="text-xs text-zinc-400 truncate">{captureTime}</p>
            </div>
            {isPlaying && (
              <button
                onClick={handleStopAudio}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
                title="Stop speaking"
              >
                <VolumeX className="w-4 h-4 text-zinc-300" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {/* Barcode info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Symbology</span>
                <p className="text-sm font-semibold text-zinc-300 mt-0.5">{scannedResult?.format}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Barcode</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-sm font-semibold text-zinc-300 font-mono truncate flex-1">{scannedResult?.text}</p>
                  <button
                    onClick={() => copyToClipboard(scannedResult?.text || '')}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors shrink-0"
                    title="Copy barcode"
                  >
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search section */}
            <div className="border-t border-zinc-800 pt-3">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                Web Search Result
              </span>

              {isSearching && (
                <div className="flex items-center gap-3 mt-3 bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Searching Google...</p>
                    <p className="text-xs text-zinc-500">Looking up product information</p>
                  </div>
                </div>
              )}

              {searchError && (
                <div className="mt-3 bg-red-950/30 rounded-xl p-4 border border-red-900/50">
                  <p className="text-sm text-red-400">Search failed: {searchError}</p>
                </div>
              )}

              {searchResult && !isSearching && (
                <div className="mt-3 bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {searchResult}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="px-5 pb-5 pt-1 flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors text-sm"
            >
              Dismiss
            </button>
            {searchResult && !isSearching && (
              <button
                onClick={() => speakText(searchResult, language)}
                disabled={isPlaying}
                className="py-3 px-4 bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-700 text-white font-medium rounded-xl transition-colors text-sm flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Read Aloud
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
