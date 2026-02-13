import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from "react";
import DogLoader from "./components/DogLoader";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import { GoogleAnalytics } from "./components/GoogleAnalytics";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Adopcion = lazy(() => import("./pages/Adopcion"));
const Perdidos = lazy(() => import("./pages/Perdidos"));
const InteractiveMap = lazy(() => import("./pages/InteractiveMap"));
const PetDetail = lazy(() => import("./components/PetDetail"));
const Admin = lazy(() => import("./pages/Admin"));
const Historias = lazy(() => import("./pages/Historias"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorBoundary>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <GoogleAnalytics />
            <HelmetProvider>
              <Suspense fallback={<DogLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/adopcion" element={<Adopcion />} />
                  <Route path="/perdidos" element={<Perdidos />} />
                  <Route path="/mapa" element={<InteractiveMap />} />
                  {/* Pet Detail Route can assist both adoption and lost pets */}
                  <Route path="/mascota/:id" element={<PetDetail />} />
                  <Route path="/pet/:id" element={<PetDetail />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/historias" element={<Historias />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </HelmetProvider>
          </BrowserRouter>
        </TooltipProvider>
      </GlobalErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
