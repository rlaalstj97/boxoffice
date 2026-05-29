import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, Flame, Users, CalendarCheck2 } from "lucide-react";
import { DailyBoxOfficeItem } from "../types";

interface MovieListProps {
  movies: DailyBoxOfficeItem[];
  selectedMovieCd: string | null;
  onSelectMovie: (movieCd: string) => void;
}

export default function MovieList({
  movies,
  selectedMovieCd,
  onSelectMovie,
}: MovieListProps) {
  
  // High-performance helpers for number and money styling
  const formatNumber = (valStr: string) => {
    const num = parseInt(valStr, 10);
    return isNaN(num) ? valStr : num.toLocaleString();
  };

  const formatSales = (salesStr: string) => {
    const sales = parseInt(salesStr, 10);
    if (isNaN(sales)) return salesStr;
    if (sales >= 100000000) {
      return `${(sales / 100000000).toFixed(1)}억원`;
    }
    return `${(sales / 10000).toFixed(0)}만원`;
  };

  // Motion animation parameters
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 22,
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="hidden">
        {/* We keep the structural header in sidebar instead */}
        <h2 className="font-display font-semibold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500 fill-red-500/10" />
          박스오피스 순위
        </h2>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          Top 10 Movies
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-2.5"
      >
        {movies.map((movie) => {
          const isSelected = selectedMovieCd === movie.movieCd;
          const rankIntenNum = parseInt(movie.rankInten, 10);
          const isNew = movie.rankOldAndNew === "NEW";

          return (
            <motion.div
              id={`movie-card-${movie.movieCd}`}
              key={movie.movieCd}
              variants={itemVariants}
              onClick={() => onSelectMovie(movie.movieCd)}
              className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border outline-none
                ${isSelected 
                  ? "bg-[#E2B616]/10 border-[#E2B616]/65 shadow-md ring-1 ring-[#E2B616]/50 dark:bg-white/5 dark:border-[#E2B616]/60"
                  : "bg-white border-zinc-200/60 hover:bg-zinc-50 hover:border-zinc-300 dark:bg-transparent dark:border-white/5 dark:hover:bg-white/5 dark:hover:border-white/10"
                }
              `}
              whileHover={{ 
                y: -1,
                boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.05)"
              }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Rank Position Graphic (IMDb Styled Serif Italic Number) */}
              <div className="flex flex-col items-center justify-center min-w-10 text-center select-none shrink-0">
                <span className={`font-serif italic font-black text-3xl transition-colors duration-250
                  ${isSelected
                    ? "text-[#E2B616]"
                    : "text-zinc-300 group-hover:text-zinc-450 dark:text-white/20 dark:group-hover:text-white/40"
                  }
                `}>
                  {movie.rank}
                </span>

                {/* Sub-badge: Rank Delta or NEW badge */}
                <div className="mt-1 flex items-center justify-center">
                  {isNew ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E2B616]/10 text-[#E2B616] animate-pulse">
                      NEW
                    </span>
                  ) : rankIntenNum > 0 ? (
                    <span className="inline-flex items-center text-[11px] font-bold font-mono text-emerald-500">
                      <TrendingUp className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                      {rankIntenNum}
                    </span>
                  ) : rankIntenNum < 0 ? (
                    <span className="inline-flex items-center text-[11px] font-bold font-mono text-rose-500">
                      <TrendingDown className="w-3 h-3 mr-0.5 stroke-[2.5]" />
                      {Math.abs(rankIntenNum)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-zinc-400 dark:text-white/30 font-mono">
                      <Minus className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Movie Main Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`font-sans font-semibold text-sm sm:text-base tracking-tight truncate transition-colors duration-200
                    ${isSelected 
                      ? "text-zinc-900 dark:text-white" 
                      : "text-zinc-800 hover:text-[#E2B616] dark:text-white/80 dark:hover:text-white"
                    }
                  `}>
                    {movie.movieNm}
                  </h3>
                </div>

                {/* Meta details with high-contrast text */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-500 dark:text-white/40 font-sans">
                  <span>개봉 {movie.openDt.replace(/-/g, ".")}</span>
                  <span className="text-zinc-250 dark:text-white/10">|</span>
                  <span>단일 관객 <strong className="font-semibold text-zinc-700 dark:text-white/60">{formatNumber(movie.audiCnt)}명</strong></span>
                </div>

                <div className="mt-1 flex items-center text-[11px] text-zinc-400 dark:text-white/30 truncate">
                  <span>누적 {formatNumber(movie.audiAcc)}명</span>
                  <span className="mx-1.5 text-zinc-200 dark:text-white/10">|</span>
                  <span>매출액 {formatSales(movie.salesAmt)} ({movie.salesShare}%)</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
