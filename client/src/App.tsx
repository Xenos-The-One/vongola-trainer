import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
  const accent = useStore(s => s.user.accent);
  const fontSize = useStore(s => s.user.fontSize);
  const theme = useStore(s => s.user.theme);

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'dark' : 'light'}`}
      data-accent={accent}
      data-fontsize={fontSize}
    >
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
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppShell />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
