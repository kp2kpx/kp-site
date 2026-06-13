// Build-time generator: renders the OpenGraph card to a static PNG at
// public/og.png so the site needs no serverless route and can be fully
// static-exported for IPFS. Design is identical to the previous
// next/og route. Run: node scripts/gen-og.mjs
import { ImageResponse } from "next/og.js";
import { writeFileSync } from "node:fs";
import React from "react";

const size = { width: 1200, height: 630 };

const tree = React.createElement(
  "div",
  {
    style: {
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
    },
  },
  React.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 16 } },
    React.createElement(
      "div",
      {
        style: {
          fontSize: 26,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "#c8a24a",
        },
      },
      "K.P. Singh · @kpx"
    )
  ),
  React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column" } },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexWrap: "wrap",
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: -2,
          maxWidth: 980,
        },
      },
      React.createElement("span", { style: { color: "#ededf0" } }, "Crypto-native builder "),
      React.createElement("span", { style: { color: "#e3c378" } }, "& ecosystem operator")
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          marginTop: 28,
          fontSize: 30,
          color: "#a1a1ab",
          maxWidth: 920,
          lineHeight: 1.4,
        },
      },
      "Ex-finance → self-taught Solidity → I host the Spaces, run the builders' nights, and ship live mini-apps on Base & Farcaster."
    )
  ),
  React.createElement(
    "div",
    { style: { display: "flex", gap: 28, fontSize: 24, color: "#6b6b76" } },
    React.createElement("span", null, "Farcaster @kpx"),
    React.createElement("span", null, "X @KP2kpx"),
    React.createElement("span", null, "GitHub @kp2kpx")
  )
);

const resp = new ImageResponse(tree, { ...size });
const buf = Buffer.from(await resp.arrayBuffer());
writeFileSync("public/og.png", buf);
console.log("wrote public/og.png", buf.length, "bytes");
