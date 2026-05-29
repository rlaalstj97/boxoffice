import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clapperboard, Calendar, Sun, Moon, Sparkles, Film, 
  HelpCircle, AlertCircle, Loader2, PlaySquare, Bookmark, Flame
} from "lucide-react";
import Header from "./components/Header";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";
import { DailyBoxOfficeItem, KobisBoxOfficeResponse } from "./types";

export default function App() {
  // Compute yesterday's date formatted as YYYY-MM-DD
  const getYesterdayDateString = () => {
    const yesterday = new Date();
    // Use the reliable current time from metadata (2026-05-29) if system clock drift
    yesterday.setFullYear(2026);
    yesterday.setMonth(4); // May is index 4
    yesterday.setDate(28); // 2026-05-28
    return yesterday.toISOString().split("T")[0];
  };

  const getTodayDateString = () => {
    return "2026-05-29"; // Today is May 29, 2026
  };

  const maxDate = getYesterdayDateString(); // "2026-05-28" is max possible selectable date (only dates before today)

  const [selectedDate, setSelectedDate] = useState<string>(maxDate);
  const [movies, setMovies] = useState<DailyBoxOfficeItem[]>([]);
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true; // Sophisticated Dark is default
  });

  // Keep dark class on body synced safely
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Fetch box office movie list when date changes
  useEffect(() => {
    const fetchBoxOffice = async () => {
      setLoading(true);
      setError(null);
      
      // Convert query date from YYYY-MM-DD to YYYYMMDD
      const dateParam = selectedDate.replace(/-/g, "");
      
      try {
        const response = await fetch(`/api/boxoffice?date=${dateParam}`);
        if (!response.ok) {
          throw new Error("서버에서 순위 데이터를 가져오는 데 실패했습니다.");
        }
        const data: KobisBoxOfficeResponse = await response.json();
        
        if (data.boxOfficeResult && data.boxOfficeResult.dailyBoxOfficeList) {
          const list = data.boxOfficeResult.dailyBoxOfficeList;
          setMovies(list);
          // Auto select the #1 movie if data exists
          if (list.length > 0) {
            setSelectedMovieCd(list[0].movieCd);
          } else {
            setSelectedMovieCd(null);
          }
        } else {
          setMovies([]);
          setSelectedMovieCd(null);
          throw new Error("영화관 입장권 통합전산망 순위 데이터가 비어 있습니다.");
        }
      } catch (err: any) {
        console.error("Fetch boxoffice list error:", err);
        setError(err.message || "해당 날짜의 정보를 불러올 수 없습니다.");
        setMovies([]);
        setSelectedMovieCd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxOffice();
  }, [selectedDate]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  // Human-readable formatted date
  const formatKoreanDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F9F9FA] text-[#18181B] dark:bg-[#0A0A0B] dark:text-[#E8E8E8] transition-colors duration-300 overflow-hidden font-sans">
      
      {/* Sophisticated Header */}
      <header className="flex h-16 sm:h-20 shrink-0 items-center justify-between px-4 sm:px-8 border-b transition-colors duration-350 bg-white border-zinc-200/80 shadow-xs dark:bg-[#141416] dark:border-white/10">
        
        {/* Brand Logo Identity */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#E2B616] rounded-lg flex items-center justify-center shadow-md shadow-amber-500/10">
            <span className="text-[#0A0A0B] font-black text-lg sm:text-xl font-serif italic">K</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif italic tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              KOBIS Box Office
            </h1>
            <p className="hidden xs:block text-[10px] text-zinc-400 dark:text-white/40 uppercase tracking-widest font-mono mt-0.5">
              KOREAN BOX OFFICE DATABASE
            </p>
          </div>
        </div>

        {/* Date Selector & Mode Pill */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#E2B616] font-bold font-mono">
              Selection Date
            </span>
            <input 
              id="global-datepicker"
              type="date" 
              value={selectedDate} 
              max={maxDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-zinc-100 border border-zinc-200 text-zinc-800 focus:outline-none focus:border-[#E2B616] transition-all cursor-pointer font-mono mt-0.5 dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-[#E2B616]"
            />
          </div>
          
          {/* Theme custom select toggle pill */}
          <div className="flex bg-zinc-200/60 rounded-full p-1 border border-zinc-250 dark:bg-white/5 dark:border-white/10">
            <button 
              id="pill-dark-toggle"
              onClick={() => setIsDark(true)}
              className={`px-3 sm:px-4 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                isDark 
                  ? "bg-[#E2B616] text-[#0A0A0B] shadow-sm font-bold" 
                  : "text-zinc-500 hover:text-indigo-600 dark:text-white/40 dark:hover:text-indigo-400"
              }`}
            >
              Dark
            </button>
            <button 
              id="pill-light-toggle"
              onClick={() => setIsDark(false)}
              className={`px-3 sm:px-4 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                !isDark 
                  ? "bg-[#E2B616] text-[#0A0A0B] shadow-sm font-bold" 
                  : "text-zinc-500 hover:text-indigo-600 dark:text-white/40 dark:hover:text-indigo-400"
              }`}
            >
              Light
            </button>
          </div>
        </div>
      </header>

      {/* Main Dual Pane Content Layout */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left Side Column: Film Grid/List (40% width, min 320px) */}
        <section className="w-full md:w-[400px] border-r border-zinc-150/80 bg-white flex flex-col shrink-0 overflow-hidden dark:border-white/10 dark:bg-[#141416]/40 mobile-list-view">
          
          <div className="px-5 py-4 border-b border-zinc-150/85 bg-zinc-55 flex justify-between items-center shrink-0 dark:border-white/5 dark:bg-[#141416]/60">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E2B616] flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 bg-[#E2B616] rounded-full animate-ping"></span>
              박스오피스 TOP 10
            </h2>
            <span className="text-[10px] text-zinc-500 dark:text-white/40 font-mono font-medium">
              {formatKoreanDate(selectedDate)}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-8 h-8 text-[#E2B616] animate-spin mb-3" />
                <p className="text-xs text-zinc-500 dark:text-white/50">순위 데이터를 수신하는 중입니다...</p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center px-4">
                <AlertCircle className="w-8 h-8 text-rose-500 mb-3" />
                <span className="text-xs text-rose-500 font-semibold mb-1">에러 발생</span>
                <p className="text-xs text-zinc-400 dark:text-white/40 line-clamp-3">{error}</p>
                <button 
                  onClick={() => setSelectedDate(getYesterdayDateString())}
                  className="mt-4 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 rounded-lg text-white font-medium"
                >
                  기본 날짜로 재시도
                </button>
              </div>
            ) : (
              <MovieList 
                movies={movies} 
                selectedMovieCd={selectedMovieCd} 
                onSelectMovie={(movieCd) => setSelectedMovieCd(movieCd)} 
              />
            )}
          </div>
        </section>

        {/* Right Side Column: Film Details (60% width) */}
        {/* On mobile devices, let's allow slide details overlay if they clicked a card */}
        <section className={`flex-1 bg-gradient-to-br from-[#FFFFFF] to-[#F4F4F5] dark:from-[#0A0A0B] dark:to-[#141416]/95 overflow-hidden transition-all duration-300 md:block
          movie-detail-view-container
          ${selectedMovieCd ? "fixed inset-0 z-40 md:relative md:inset-auto" : "hidden md:block"}
        `}>
          <MovieDetail 
            movieCd={selectedMovieCd} 
            onClose={selectedMovieCd ? () => setSelectedMovieCd(null) : undefined} 
          />
        </section>
      </main>

      {/* Elegant Status Footer */}
      <footer className="h-8 shrink-0 bg-[#F4F4F5] border-t border-zinc-250 px-4 sm:px-6 flex items-center justify-between text-[9px] uppercase tracking-widest text-zinc-500 dark:bg-[#050505] dark:border-white/5 dark:text-white/30 font-mono">
        <div>KOBIS INTEGRATED NETWORK API CONNECTED</div>
        <div className="flex space-x-4 items-center">
          <span className="hidden xs:inline">STATUS: COMPLIANT</span>
          <span className="text-[#E2B616] font-bold">SYSTEM ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
