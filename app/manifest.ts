import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ICAMS | PDT Kampar",
    short_name: "ICAMS",
    description: "ICT Assets Management System PDT Kampar",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f2ed",
    theme_color: "#4f6b95",
    icons: [
      {
        src: "/pwa/icon-192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512?purpose=maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
