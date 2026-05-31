import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import BottomNav from "./components/BottomNav";
import Today from "./pages/Today";
import { useStore } from "./lib/storage";

// Today is the landing route — keep it eager so first paint never waits on a chunk.
// Everything else is route-split: Progress/Protocol/Settings/ActiveWorkout each
// ship as their own chunk, downloaded on first navigation to that route. Cuts
// initial JS shipped to first paint by ~60% and saves meaningful parse time.
const Progress = lazy(() => import("./pages/Progress"));
const Protocol = lazy(() => import("./pages/Protocol"));
const Settings = lazy(() => import("./pages/Settings"));
const ActiveWorkout = lazy(() => import("./pages/ActiveWorkout"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  // Quiet placeholder while a route chunk loads — no spinner, no jank.
  return <div className="min-h-[40vh]" aria-busy="true" />;
}

function Router() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Today} />
        <Route path="/progress" component={Progress} />
        <Route path="/protocol" component={Protocol} />
        <Route path="/settings" component={Settings} />
        <Route path="/workout" component={ActiveWorkout} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppShell() {
  const accent = useStore((s) => s.user.accent);
  const fontSize = useStore((s) => s.user.fontSize);
  const theme = useStore((s) => s.user.theme);
  const [location] = useLocation();
  const fullscreen = location.startsWith("/workout");

  // Drive theme + accent + fontSize on <html> so the whole viewport (including
  // anything outside the 480px container) follows the user's settings.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.dataset.accent = accent;
    root.dataset.fontsize = fontSize;
  }, [theme, accent, fontSize]);

  // Active Workout is a focus-mode, full-screen route — no container chrome or nav.
  if (fullscreen) {
    return <Router />;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[480px] px-4">
        <Router />
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <AppShell />
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
