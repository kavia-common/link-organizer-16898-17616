import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { SupabaseProvider, useSession } from "./supabase/SupabaseProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import RedirectPage from "./pages/RedirectPage";
import AuthPage from "./pages/AuthPage";

// PUBLIC_INTERFACE
function ProtectedRoute({ children }) {
  /** Route guard that redirects to /auth if no session. */
  const { sessionLoaded, session } = useSession();
  if (!sessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-white/70">Loading...</div>
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

// PUBLIC_INTERFACE
function AppShell() {
  /** AppShell composes navbar, routed views, and footer. */
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500/10 to-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/r/:id" element={<RedirectPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root App with Supabase provider and router. */
  return (
    <SupabaseProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </SupabaseProvider>
  );
}

export default App;
