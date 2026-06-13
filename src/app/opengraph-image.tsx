import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "K.P. Singh — Crypto-native builder & ecosystem operator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(900px 500px at 70% 0%, rgba(200,162,74,0.20), transparent 60%), radial-gradient(700px 500px at 0% 100%, rgba(79,127,255,0.16), transparent 60%), #0a0a0b",
          color: "#ededf0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#c8a24a",
            }}
          >
            K.P. Singh · @kpx
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            <span style={{ color: "#ededf0" }}>Crypto-native builder&nbsp;</span>
            <span style={{ color: "#e3c378" }}>&amp; ecosystem operator</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              color: "#a1a1ab",
              maxWidth: 920,
              lineHeight: 1.4,
            }}
          >
            Ex-finance → self-taught Solidity → I host the Spaces, run the
            builders&apos; nights, and ship live mini-apps on Base &amp;
            Farcaster.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 24,
            color: "#6b6b76",
          }}
        >
          <span>Farcaster @kpx</span>
          <span>X @KP2kpx</span>
          <span>GitHub @kp2kpx</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
