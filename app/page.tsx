export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000410",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#00C8FF",
        fontFamily: "Orbitron, sans-serif",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          fontWeight: 900,
          textShadow: "0 0 20px rgba(0,200,255,0.7)",
        }}
      >
        LA CENTRAL
      </h1>

      <p
        style={{
          marginTop: "20px",
          fontSize: "18px",
          opacity: 0.7,
        }}
      >
        Sistema Maestro de Control de Apps
      </p>
    </main>
  );
}
