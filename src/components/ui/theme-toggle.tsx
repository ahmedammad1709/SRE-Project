import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      <Sun className={`absolute transition-all duration-300 ${isDark ? "opacity-0 scale-75" : "opacity-100 scale-100"}`} />
      <Moon className={`transition-all duration-300 ${isDark ? "opacity-100 scale-100" : "opacity-0 scale-75"}`} />
    </Button>
  );
};

export default ThemeToggle;
