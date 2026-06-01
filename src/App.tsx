import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import NotFound from "./pages/NotFound.tsx";
import PlantsPage from "./pages/PlantsPage.tsx";
import BlueprintPage from "./pages/BlueprintPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster richColors position="bottom-right" theme="dark" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/plants" element={<PlantsPage />} />
            <Route path="/plants/:plantId/blueprint" element={<BlueprintPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
