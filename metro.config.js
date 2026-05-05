// @ts-check
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import("expo/metro-config").MetroConfig} */
const config = getDefaultConfig(__dirname);

// #region agent log
fetch("http://127.0.0.1:7745/ingest/b513b559-30fc-4e04-927f-ab5e4bc17f6b", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "500a3d",
  },
  body: JSON.stringify({
    sessionId: "500a3d",
    location: "metro.config.js:module",
    message: "Metro config evaluated (bundler toolchain reached)",
    data: { cwd: process.cwd(), node: process.version },
    timestamp: Date.now(),
    hypothesisId: "H1",
    runId: "pre-fix",
  }),
}).catch(() => {});
// #endregion

module.exports = config;
