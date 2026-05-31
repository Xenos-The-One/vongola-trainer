import { createRoot } from "react-dom/client";
import App from "./App";

// Self-hosted fonts (bundled + precached by the PWA) so the app's typography is
// fully offline-capable and not render-blocked on a third-party request.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/800.css";

import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// The service worker is registered automatically by vite-plugin-pwa
// (registerType: 'autoUpdate', injectRegister: 'auto') in production builds.
