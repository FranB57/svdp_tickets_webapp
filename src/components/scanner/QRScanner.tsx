import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'requesting' | 'granted' | 'denied'>('prompt');

  // Request camera permission explicitly
  const requestCameraPermission = async (): Promise<boolean> => {
    setPermissionState('requesting');
    try {
      // Explicitly request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      // Stop the stream immediately - we just needed to get permission
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      return true;
    } catch (err) {
      console.error('Camera permission denied:', err);
      setPermissionState('denied');
      return false;
    }
  };

  useEffect(() => {
    const scannerId = 'qr-scanner-region';
    let mounted = true;

    const startScanner = async () => {
      // First, explicitly request camera permission
      const hasAccess = await requestCameraPermission();
      if (!hasAccess || !mounted) {
        setHasPermission(false);
        onError?.('Camera access denied');
        return;
      }

      // Initialize scanner after permission granted
      scannerRef.current = new Html5Qrcode(scannerId);

      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success callback
            onScan(decodedText);
          },
          () => {
            // Error callback (called frequently when no QR found, ignore)
          }
        );
        if (mounted) {
          setIsStarted(true);
          setHasPermission(true);
        }
      } catch (err) {
        console.error('Failed to start scanner:', err);
        if (mounted) {
          setHasPermission(false);
          onError?.('Camera access denied');
        }
      }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan, onError]);

  const handleRetryPermission = () => {
    setHasPermission(null);
    setPermissionState('prompt');
    // Force re-mount by changing key (handled in parent) or just retry
    window.location.reload();
  };

  return (
    <div className="relative">
      <div
        id="qr-scanner-region"
        className="w-full aspect-square max-w-sm mx-auto rounded-xl overflow-hidden bg-black"
      />

      {/* Scanner overlay */}
      {isStarted && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50" />
        </div>
      )}

      {/* Permission denied message */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl">
          <div className="text-center text-white p-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            <p className="text-sm font-medium mb-1">Camera access denied</p>
            <p className="text-xs text-gray-400 mb-3">
              Please allow camera access in your browser settings
            </p>
            <button
              onClick={handleRetryPermission}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading/requesting permission state */}
      {hasPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl">
          <div className="text-center text-white p-4">
            {permissionState === 'requesting' ? (
              <>
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-svdp-blue-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium mb-1">Camera Permission Required</p>
                <p className="text-xs text-gray-400">
                  Please allow camera access when prompted
                </p>
              </>
            ) : (
              <>
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm">Starting camera...</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
