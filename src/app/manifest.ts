import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mbn Riad",
    short_name: "Mbn Riad",
    description:
      "Riad traditionnel à Marrakech — Réservation directe, sans frais de plateforme.",
    start_url: "/fr",
    scope: "/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: "#8B3A2A",
    orientation: "portrait-primary",
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
