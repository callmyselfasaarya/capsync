import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Navbar from "./components/Navbar";

const Index = lazy(() => import("./pages/Index"));
const GeneratePage = lazy(() => import("./pages/GeneratePage"));
const EditorPage = lazy(() => import("./pages/EditorPage"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage"));
const ExamplesPage = lazy(() => import("./pages/ExamplesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const PageSkeleton = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-4">
    <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
    <p className="text-sm text-muted-foreground animate-pulse">Loading CapSync...</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SpeedInsights />
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/examples" element={<ExamplesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
