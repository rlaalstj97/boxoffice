import { motion } from "motion/react";
import { Sun, Moon, Calendar, Clapperboard } from "lucide-react";

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  maxDate: string;
}

export default function Header({
  selectedDate,
  onDateChange,
  isDark,
  toggleDarkMode,
  maxDate,
}: HeaderProps) {
  // Format long date Korean format (e.g., 2026년 05월 28일)
  const formatKoreanDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <header className="sticky top-0 z-30 transition-colors duration-300 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clapperboard className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-zinc-900 to-indigo-700 dark:from-zinc-100 dark:to-indigo-400 bg-clip-text text-transparent">
                Box Office
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-sans">
                영화진흥위원회 통합전산망 자료 제공
              </p>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between md:justify-end">
            {/* Date Selection */}
            <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
              <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <input
                id="boxoffice-datepicker"
                type="date"
                value={selectedDate}
                max={maxDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer border-none p-0 text-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* Selected Date Summary Indicator */}
            <div className="hidden lg:block text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-55/10 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              {formatKoreanDate(selectedDate)} 박스오피스
            </div>

            {/* Dark Mode Toggle */}
            <motion.button
              id="theme-toggle-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all shadow-sm text-zinc-600 dark:text-zinc-400"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
