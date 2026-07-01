import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { LanguageProvider } from "../lib/i18n/LanguageProvider";
import { ThemeProvider } from "../lib/theme/ThemeProvider";
import { router } from "./routes";

const queryClient = new QueryClient();

export function AppProviders() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
