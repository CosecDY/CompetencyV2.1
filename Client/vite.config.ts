import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@Components": path.resolve(__dirname, "src/components"),
      "@Contexts": path.resolve(__dirname, "src/contexts"),
      "@Hooks": path.resolve(__dirname, "src/hooks"),
      "@Services": path.resolve(__dirname, "src/services"),
      "@Pages": path.resolve(__dirname, "src/pages"),
      "@Types": path.resolve(__dirname, "src/types"),
      "@Layouts": path.resolve(__dirname, "src/layouts"),
      "@Utils": path.resolve(__dirname, "src/utils"),
    },
  },
  // Source map configuration
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split each major page into its own chunk
          home: ["src/pages/Home/HomePage.tsx"],
          about: ["src/pages/About/AboutPage.tsx"],
          "competency-detail": ["src/pages/competencyDetail/CompetencyDetailPage.tsx"],
          "search-results": ["src/pages/SearchResults/SearchResultsPage.tsx"],
          profile: ["src/pages/ProfilePage/ProfilePage.tsx"],
          // Admin pages
          "admin-dashboard": ["src/pages/Admin/Dashboard/DashboardPage.tsx"],
          "admin-users": ["src/pages/Admin/Users/UserPages.tsx"],
          "admin-permissions": ["src/pages/Admin/Permission/Permission/PermissionPage.tsx"],
          // Admin SFIA/TPQI exports
          "admin-sfia": ["src/pages/Admin/SFIA/ExportSFIAPages.tsx"],
          "admin-tpqi": ["src/pages/Admin/TPQI/ExportTPQIPages.tsx"],
        },
      },
    },
  },
  server: {
    allowedHosts: ["client_app", "ec2-13-54-113-16.ap-southeast-2.compute.amazonaws.com"],
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    allowedHosts: ["client_app", "localhost", "127.0.0.1", "nginx", "172.19.0.4", "ec2-13-54-113-16.ap-southeast-2.compute.amazonaws.com"],
  },
});
