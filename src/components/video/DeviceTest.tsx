import React, { useRef, useEffect, useState } from "react";

export function DeviceTest({ onProceed }: { onProceed: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Could not access camera/microphone. Please check permissions.");
      }
    }
    getDevices();
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: 32 }}>
      <h2>Test Your Camera & Microphone</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        <video ref={videoRef} autoPlay playsInline style={{ width: 320, height: 240, background: "#111" }} />
      </div>
      <div>
        <audio ref={audioRef} autoPlay controls />
        <div style={{ fontSize: 12, color: "#888" }}>
          You should hear your own voice here (microphone loopback).
        </div>
      </div>
      <button onClick={onProceed} style={{ marginTop: 24, padding: "8px 24px", fontSize: 16 }}>
        Proceed to Consultation
      </button>
    </div>
  );
}