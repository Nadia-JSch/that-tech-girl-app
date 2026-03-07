import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    server: {
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8787",
                changeOrigin: true
            }
        }
    },
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["icon.svg"],
            manifest: {
                name: "That Tech Girl",
                short_name: "Tech Girl",
                description: "A pastel-drenched daily ritual app with affirmations and practical micro-lessons for women in tech.",
                theme_color: "#ffd6ea",
                background_color: "#fff8fc",
                display: "standalone",
                start_url: "/",
                icons: [
                    {
                        src: "icon.svg",
                        sizes: "512x512",
                        type: "image/svg+xml",
                        purpose: "any"
                    }
                ]
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,svg,png,ico}"]
            }
        })
    ]
});
