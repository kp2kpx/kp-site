/* ============================================================
   SOURCE OF TRUTH: every line here must be TRUE.
   No invented facts. Placeholders are marked PLACEHOLDER and
   must be confirmed before publishing widely.
   ============================================================ */

export const PROFILE = {
  name: "K.P. Singh",
  handle: "@kpx",
  identity: "Crypto-native builder & ecosystem operator",
  hook:
    "Ex-finance turned self-taught Solidity builder. I host the Spaces, run the builders' nights, and ship live mini-apps in the Base & Farcaster ecosystem.",
  location: "New Delhi, India",
};

export const LINKS = {
  farcaster: { label: "Farcaster", handle: "@kpx", url: "https://warpcast.com/kpx" },
  x: { label: "X", handle: "@KP2kpx", url: "https://x.com/KP2kpx" },
  github: { label: "GitHub", handle: "@kp2kpx", url: "https://github.com/kp2kpx" },
  email: { label: "Email", handle: "kamal.kps@gmail.com", url: "mailto:kamal.kps@gmail.com" },
  telegram: { label: "Telegram", handle: "@kp2kpx", url: "https://t.me/kp2kpx" },
};

export const NOW = [
  {
    title: "Ecosystem & community",
    body:
      "I host X Spaces for Base India and InnerCircle, run builders' nights where people demo live, and host a chess-meets-crypto show. The community work is the work.",
  },
  {
    title: "Building in public",
    body:
      "Self-taught Solidity from zero on a borrowed laptop. I ship live products: mini-apps, a paid API, and onchain games, and I document the journey.",
  },
  {
    title: "Open to",
    body:
      "DevRel / Developer Advocate / Ecosystem / Community roles, ideally Base or Farcaster-adjacent. I turn builders into a community and a community into shipped products.",
  },
];

/* The story, told with restraint. Each beat is true. */
export const STORY = [
  {
    year: "2006 - 2018",
    title: "Finance, and a lot of deep ends",
    body:
      "B.Com in Economics from the University of Lucknow. Then a decade of being thrown into the deep end: QuickBooks support at an IBM call centre, self-taught forex and stock trading, an investment-advisor stint at Angel Broking, and coordinating US trucking dispatch and accounts remotely from India. I learned to operate where nobody hands you a manual.",
  },
  {
    year: "2018 - 2021",
    title: "Goa: I built things from scratch",
    body:
      "I ran a traveller hostel solo, built websites, social, menus and visiting cards for Goa businesses, and ran twice-weekly open mics end to end. Then I opened Fresh2O, a beachside smoothie café I built myself: woodwork, paint, plumbing, electrical, every shift. In 2021 the second COVID wave and Cyclone Tauktae destroyed it. The café didn't fail. Acts of god did.",
  },
  {
    year: "2021",
    title: "Broke, in the Himalayas, on a phone",
    body:
      "After the café I went to the mountains and traded crypto on a mobile phone wherever I could find signal. It kept me afloat. I found Vitalik's writing and decided to learn how this actually works. That October I borrowed money from my parents and a laptop from my girlfriend, and taught myself Solidity from zero, no prior coding, no HTML. Just contracts and NFTs until they worked.",
  },
  {
    year: "2021 - present",
    title: "Into the ecosystem, for real",
    body:
      "Crypto researcher at DeQuest. Decentralized-support work with Consensys / VillageDAO helping MetaMask users across EVM networks. Then Farcaster: I joined FBI (Farcaster Builders of India, now InnerCircle) and became an OG and mentor. The first salary I earned bought the laptop I still build on today.",
  },
];

export const COMMUNITY = [
  {
    tag: "HOSTING",
    title: "X Spaces: Base India & InnerCircle",
    body:
      "Hosted many Spaces (Nov 2025 - Apr 2026): inviting and interviewing builders, founders and ecosystem guests live.",
  },
  {
    tag: "HOSTING",
    title: "Builders' Nights",
    body:
      "Ran live sessions where builders demo their projects to the community: part hype, part feedback loop, all signal.",
  },
  {
    tag: "SHOW",
    title: "Chess & Crypto",
    body:
      "A live show where I play chess with a guest while we talk through crypto news and what's happening onchain.",
  },
  {
    tag: "EVENT",
    title: "den.show chess tournament",
    body:
      "Ran a live chess tournament for den.show: full event management, start to finish.",
  },
  {
    tag: "COMMUNITY",
    title: "FBI / InnerCircle: OG & mentor",
    body:
      "An early member of Farcaster Builders of India (founded by Saumya, now at Base). Mentor builders, met many at fellowships and crypto events across India.",
  },
  {
    tag: "GAME",
    title: "Based Games: 2 seasons",
    body:
      "Ran two seasons of Based Games, an onchain community game that kept the community playing and shipping together.",
  },
];

export const BUILDS = [
  {
    name: "GLADAITORS",
    status: "Live mini-app",
    blurb:
      "A Farcaster mini-app betting game on Base. AI gladiators fight onchain; players bet on the outcome, with a 10% house cut.",
    stack: ["Farcaster", "Base", "Solidity", "Next.js"],
    url: "https://gladaitors.vercel.app/",
    urlLabel: "gladaitors.vercel.app",
  },
  {
    name: "Farcaster Intel API",
    status: "Live · on x402scan",
    blurb:
      "A paid API built on the x402 v2 payment standard: pay-per-call data for the Farcaster ecosystem. Listed on x402scan.",
    stack: ["x402", "Base", "API", "Farcaster"],
    url: "https://farcaster-intel-api.vercel.app",
    urlLabel: "farcaster-intel-api.vercel.app",
  },
  {
    name: "x402 integration consulting",
    status: "Available",
    blurb:
      "I help Base builders ship working x402 payment integrations, from broken listings to live, paid endpoints.",
    stack: ["x402", "Base", "Integration"],
    url: "",
    urlLabel: "Get in touch",
  },
];
