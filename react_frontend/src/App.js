import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./index.css";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import RedirectPage from "./pages/RedirectPage";
import AuthPage from "./pages/AuthPage";
import { SupabaseProvider, useSession } from "./supabase/SupabaseProvider";

// PUBLIC_INTERFACE
function ProtectedRoute({ children }) {
  /** Route guard that redirects to /auth if no session. */
  const { sessionLoaded, session } = useSession();
  if (!sessionLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <div className="animate-pulse opacity-80">Loading...</div>
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  return children;
}

function RoutedViews() {
  const location = useLocation();
  return (
    <div key={location.pathname}>
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
    </div>
  );
}

// PUBLIC_INTERFACE
function AppShell() {
  /** AppShell composes navbar, routed views, and footer with premium dark layout. */
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <header>
        <Navbar />
      </header>
      <main id="main" className="flex-1 p-4" role="main" tabIndex={-1}>
        <RoutedViews />
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
