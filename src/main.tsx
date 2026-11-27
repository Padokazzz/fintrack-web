import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "./app/providers";
import "./index.css";
import { clearLegacyWebSession } from "./lib/auth-storage";

clearLegacyWebSession();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);