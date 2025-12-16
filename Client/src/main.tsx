import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Loading } from "@Components/Admin/ExportComponent";
import { ThemeProvider } from "@Contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTop from "@Components/Competency/ScrolToTop";
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      {/* <AuthProvider> */}
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <React.Suspense fallback={<Loading />}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </React.Suspense>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
