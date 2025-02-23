import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shariah Support and Services",
    short_name: "SSS",
    description: "To create awareness of Islamic banking among the public, Training at LnD and corporate CBSME and Agri client visits.",
    start_url: "/daily-activity",
    scope: "/daily-activity",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait",
    dir: "ltr",
    lang: "en",
    id: "sss",
    display_override: [
      "standalone",
      "minimal-ui",
      "fullscreen",
      "browser",
      "window-controls-overlay"
    ],
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      }
    ],
    categories: ["productivity"]
  };
}
