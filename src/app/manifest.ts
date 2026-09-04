import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "R. Sakulanda",
    description: site.positioning,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ee",
    theme_color: "#0e1b2a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
