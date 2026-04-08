import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ActivityOverlays",
    short_name: "ActivityOverlays",
    description: "Create beautiful transparent PNG overlays and insights from your Strava activities",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F5F5F5",
    theme_color: "#FC5200",
    icons: [
      {
        src: "/favicon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}