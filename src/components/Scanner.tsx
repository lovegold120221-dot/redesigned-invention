import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';
import { ScanBarcode, Camera, Play, Square, CheckCircle2, Copy } from 'lucide-react';

export default function Scanner() {
    const [devices, setDevices] = useState<CameraDevice[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);
    const [scannedResult, setScannedResult] = useState<{ text: string, format: string } | null>(null);
    const [captureTime, setCaptureTime] = useState<string>('');
    
    // We keep a mutable reference to the scanner instance to ensure cleanup works across re-renders
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        // Initialize available cameras
        Html5Qrcode.getCameras().then(availableDevices => {
            if (availableDevices && availableDevices.length > 0) {
                setDevices(availableDevices);
                setSelectedCameraId(availableDevices[0].id);
            }
        }).catch(err => {
            console.error("Camera detection error:", err);
        });

        // Cleanup on unmount
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, []);

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

    const startScanning = async () => {
        if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode("reader");
        }

        const config = {
            fps: 15,
            qrbox: { width: 288, height: 180 },
            aspectRatio: 1.0
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
                        format: decodedResult.result.format?.formatName || 'Unknown'
                    });
                    setCaptureTime(`Captured at ${new Date().toLocaleTimeString()}`);
                },
                (errorMessage) => {
                    // Ignore background scan failures
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Failed to start scanning:", err);
            stopScanning();
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (err) {
                console.error("Error stopping scanning gracefully:", err);
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

    const copyToClipboard = () => {
        if (scannedResult) {
            navigator.clipboard.writeText(scannedResult.text).then(() => {
                // Could implement a toast here
                alert('Copied to clipboard');
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        }
    };

    return (
        <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col items-center justify-between font-sans antialiased select-none w-full">
            {/* Header */}
            <header className="w-full max-w-md px-6 py-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <ScanBarcode className="w-6 h-6 text-emerald-500" />
                    <span className="font-semibold tracking-wide text-sm uppercase">Smart Scan v1.0</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
                    <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`}></span>
                    <span className={isScanning ? 'text-emerald-400' : 'text-zinc-400'}>{isScanning ? 'Scanning Active' : 'Standby'}</span>
                </div>
            </header>

            {/* Scanner Container */}
            <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-4 relative">
                <div className="relative w-full aspect-[3/4] max-h-[500px] bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
                    {/* Html5Qrcode target MUST be rendered consistently */}
                    <div id="reader" className="w-full h-full object-cover"></div>

                    {/* Overlay Mask */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                        <div className="flex-1 bg-black/60 w-full"></div>
                        <div className="flex h-[180px] w-full">
                            <div className="flex-1 bg-black/60"></div>
                            {/* Viewfinder area */}
                            <div className="w-[288px] h-[180px] relative border border-zinc-700/30">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-md"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-md"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-md"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-md"></div>

                                {/* Laser Animation */}
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

                    {/* Placeholder when not scanning */}
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
            <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4 transition-all duration-300 ${scannedResult ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden transform transition-transform duration-300 ${scannedResult ? 'translate-y-0' : 'translate-y-8'}`}>
                    {/* Success Header */}
                    <div className="bg-emerald-950/40 px-6 py-5 border-b border-zinc-800/80 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Auto Captured Successfully</h3>
                            <p className="text-xs text-zinc-400">{captureTime}</p>
                        </div>
                    </div>
                    
                    {/* Captured Data */}
                    <div className="p-6 flex flex-col gap-4">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Symbology</span>
                            <p className="text-sm font-semibold text-zinc-300 mt-0.5">{scannedResult?.format}</p>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Decoded Output</span>
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mt-1 font-mono text-emerald-400 text-lg break-all select-all flex items-center justify-between gap-2">
                                <span>{scannedResult?.text || '-'}</span>
                                <button onClick={copyToClipboard} className="text-zinc-500 hover:text-white transition-colors p-1" title="Copy to Clipboard">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="px-6 pb-6 pt-2 flex gap-3">
                        <button 
                            onClick={() => setScannedResult(null)}
                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors text-sm"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
