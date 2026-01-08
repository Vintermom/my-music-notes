import { Music } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Music className="h-8 w-8 text-primary" />
        </div>
        <span className="text-lg font-medium text-foreground">My Music Notes</span>
      </div>
    </div>
  );
}
