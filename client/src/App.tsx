import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import BottomNav from "./components/BottomNav";
import Today from "./pages/Today";
import Log from "./pages/Log";
import Progress from "./pages/Progress";
import Protocol from "./pages/Protocol";
import Settings from "./pages/Settings";
import { useStore } from "./lib/storage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Today} />
      <Route path="/log" component={Log} />
      <Route path="/progress" component={Progress} />
      <Route path="/protocol" component={Protocol} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  const accent = useStore((s) => s.user.accent);
  const fontSize = useStore((s) => s.user.fontSize);
  const theme = useStore((s) => s.user.theme);

  // Drive theme + accent + fontSize on <html> so the whole viewport (including
  // anything outside the 480px container) follows the user's settings.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.dataset.accent = accent;
    root.dataset.fontsize = fontSize;
  }, [theme, accent, fontSize]);

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
