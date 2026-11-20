import type { MetadataRoute } from "next";

// Permite "instalar" Chumbo en el celular como una app (PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chumbo",
    short_name: "Chumbo",
    description: "Propinas y regalos con un QR por persona.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
