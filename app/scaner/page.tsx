"use client";

import { useRef, useState } from "react";
import Tesseract from "tesseract.js";

const allergens = [
  "linalool",
  "citronellol",
  "hexyl cinnamal",
  "methylchloroisothiazolinone",
  "methylisothiazolinone",
  "benzisothiazolinone",
];

export default function ScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [detected, setDetected] = useState<string[]>([]);

  const startCamera = async () => {
    setResult(null);
    setDetected([]);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setScanning(true);
    setResult("Analizando etiqueta...");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");

    const {
      data: { text },
    } = await Tesseract.recognize(imageData, "eng");

    const lowerText = text.toLowerCase();

    const found = allergens.filter((allergen) =>
      lowerText.includes(allergen)
    );

    if (found.length > 0) {
      setDetected(found);
      setResult("⚠️ ALERTA: Ingrediente peligroso detectado");
    } else {
      setResult("✅ No se detectaron tus alérgenos en el texto");
    }

    setScanning(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000410",
        color: "#00C8FF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>SilberAlert Scanner</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", maxWidth: "400px", borderRadius: "12px" }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={startCamera}
          style={{
            padding: "10px 20px",
            background: "#003366",
            color: "#00C8FF",
            border: "1px solid #00C8FF",
            borderRadius: "8px",
          }}
        >
          Activar Cámara
        </button>

        <button
          onClick={captureAndScan}
          disabled={scanning}
          style={{
            padding: "10px 20px",
            background: "#660000",
            color: "#ffaaaa",
            border: "1px solid red",
            borderRadius: "8px",
          }}
        >
          {scanning ? "Escaneando..." : "Escanear"}
        </button>
      </div>

      {result && (
        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "bold",
            color: detected.length > 0 ? "red" : "#00ff88",
          }}
        >
          {result}

          {detected.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              Detectados:
              <ul>
                {detected.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
