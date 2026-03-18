import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import DocsLayout from "@/components/DocsLayout";
import InboxPage from "@/pages/InboxPage";
import PromptsPage from "@/pages/PromptsPage";
import VaultPage from "@/pages/VaultPage";
import AuthPage from "@/pages/AuthPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ProfilePage from "@/pages/ProfilePage";
import CommunityPage from "@/pages/CommunityPage";
import BuildersPage from "@/pages/BuildersPage";
import LandingPage from "@/pages/LandingPage";
import SharedArtifactPage from "@/pages/SharedArtifactPage";
import DocsHomePage from "@/pages/docs/DocsHomePage";
import ArchitecturePage from "@/pages/docs/ArchitecturePage";
import ComponentsPage from "@/pages/docs/ComponentsPage";
import DataFlowPage from "@/pages/docs/DataFlowPage";
import ApiPage from "@/pages/docs/ApiPage";
import DependenciesPage from "@/pages/docs/DependenciesPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/ideas" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="vibesfolio-theme" enableSystem={false}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
            <Route path="/auth" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
            <Route path="/shared/:artifactId" element={<SharedArtifactPage />} />
            <Route path="/docs" element={<DocsLayout />}>
              <Route index element={<DocsHomePage />} />
              <Route path="architecture" element={<ArchitecturePage />} />
              <Route path="components" element={<ComponentsPage />} />
              <Route path="data-flow" element={<DataFlowPage />} />
              <Route path="api" element={<ApiPage />} />
              <Route path="dependencies" element={<DependenciesPage />} />
            </Route>
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<Navigate to="/ideas" replace />} />
                      <Route path="/ideas" element={<InboxPage />} />
                      <Route path="/prompts" element={<PromptsPage />} />
                      <Route path="/vault" element={<VaultPage />} />
                      <Route path="/community" element={<CommunityPage />} />
                      <Route path="/community/builders" element={<BuildersPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
