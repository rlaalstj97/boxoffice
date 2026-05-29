import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, Clock, Calendar, Globe, Award, Sparkles, 
  Users, Landmark, ChevronLeft, AlertCircle, HelpCircle, Loader2, Play 
} from "lucide-react";
import { KobisMovieDetailResponse, MovieInfo } from "../types";

interface MovieDetailProps {
  movieCd: string | null;
  rank?: string;
  onClose?: () => void;
}

export default function MovieDetail({ movieCd, rank = "1", onClose }: MovieDetailProps) {
  const [detail, setDetail] = useState<MovieInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieCd) {
      setDetail(null);
      return;
    }

    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/movie/${movieCd}`);
        if (!response.ok) {
          throw new Error("영화 상세 정보를 가져올 수 없습니다.");
        }
        const data: KobisMovieDetailResponse = await response.json();
        
        if (data.movieInfoResult && data.movieInfoResult.movieInfo) {
          setDetail(data.movieInfoResult.movieInfo);
        } else {
          throw new Error("유효하지 않은 응답 데이터입니다.");
        }
      } catch (err: any) {
        console.error("Fetch detail error:", err);
        setError(err.message || "상세정보 조회 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [movieCd]);

  // Color-coded age ratings helper in Korea
  const getAuditBadgeStyles = (gradeNm: string) => {
    if (!gradeNm) return "border-white/10 text-white/50 bg-white/5";
    if (gradeNm.includes("전체")) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (gradeNm.includes("12")) {
      return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    }
    if (gradeNm.includes("15")) {
      return "bg-amber-500/10 text-amber-450 border-amber-500/30";
    }
    if (gradeNm.includes("청소년") || gradeNm.includes("19") || gradeNm.includes("제한")) {
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
    return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
  };

  // Helper to format date String "YYYYMMDD" to human readable format
  const formatDetailDate = (dateStr: string) => {
    if (!dateStr || dateStr.length < 8) return dateStr;
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}년 ${month}월 ${day}일`;
  };

  const formattedRank = parseInt(rank, 10) < 10 ? `0${rank}` : rank;

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-[#0A0A0B] to-[#1A1A1C] dark:from-[#0A0A0B] dark:to-[#1A1A1C] [&:not(.dark)]:from-[#FFFFFF] [&:not(.dark)]:to-[#F4F4F5]">
      
      {/* Background Giant Watermark (Signature of Sophisticated Dark Theme) */}
      {detail && (
        <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] dark:opacity-[0.04] [&:not(.dark)]:opacity-[0.05] pointer-events-none select-none z-0">
          <span className="text-[200px] sm:text-[320px] font-serif italic leading-none font-black text-white [&:not(.dark)]:text-zinc-900">
            {formattedRank}
          </span>
        </div>
      )}

      {/* Mobile-back navigation banner */}
      {onClose && (
        <div className="px-4 py-3.5 border-b border-white/10 dark:border-white/10 flex items-center bg-[#141416]/90 dark:bg-[#141416]/90 [&:not(.dark)]:bg-white/90 [&:not(.dark)]:border-zinc-200/80 z-20 md:hidden">
          <button
            id="close-detail-mobile-btn-custom"
            onClick={onClose}
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#E2B616] hover:brightness-110 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            목록으로 돌아가기
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 sm:p-10 z-10 relative">
        <AnimatePresence mode="wait">
          {!movieCd ? (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 border border-white/10 dark:border-white/10 rounded-2xl bg-white/5 dark:bg-white/5 [&:not(.dark)]:bg-white [&:not(.dark)]:border-zinc-200 min-h-[400px]"
            >
              <div className="p-4 rounded-xl bg-white/5 dark:bg-white/5 [&:not(.dark)]:bg-zinc-100 text-[#E2B616] mb-5 ring-4 ring-white/5">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="font-serif italic text-white [&:not(.dark)]:text-zinc-900 text-xl font-semibold">
                Select a Movie
              </h3>
              <p className="text-white/40 [&:not(.dark)]:text-zinc-500 max-w-sm text-xs mt-2 leading-relaxed">
                좌측 일일 순위표에서 원하시는 영화를 터치/클릭 하시면, 개봉사 목록, 주연 배우진 및 국문 세부 명세 등의 상세 정보를 조회하실 수 있습니다.
              </p>
            </motion.div>
          ) : loading ? (
            /* Loading State */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center py-24 text-center"
            >
              <Loader2 className="w-10 h-10 text-[#E2B616] animate-spin mb-4" />
              <p className="text-white/50 dark:text-white/50 [&:not(.dark)]:text-zinc-500 text-xs tracking-wider uppercase font-mono">
                FETCHING SECURE DATA PLATFORM...
              </p>
            </motion.div>
          ) : error ? (
            /* Error State */
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="p-3 bg-rose-500/10 text-rose-450 rounded-full mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-white [&:not(.dark)]:text-zinc-900">상세내역 오류</h4>
              <p className="text-white/40 [&:not(.dark)]:text-zinc-500 text-xs max-w-xs mt-2">
                {error}
              </p>
            </motion.div>
          ) : detail ? (
            /* Detailed Card View */
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Media Poster Frame Component + Right Metadata */}
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Poster Mockup frame (Sophisticated Dark Signature Layout) */}
                <div className="w-full sm:w-60 h-80 bg-[#141416] border border-white/15 dark:bg-[#141416] dark:border-white/15 [&:not(.dark)]:bg-white [&:not(.dark)]:border-zinc-300 rounded-xl flex-shrink-0 flex flex-col justify-between p-5 relative overflow-hidden shadow-xl shadow-black/30">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E2B616]"></div>
                  
                  <div className="text-left py-2">
                    <span className="text-[10px] font-serif italic text-white/40 [&:not(.dark)]:text-zinc-400 block tracking-widest uppercase">
                      Official Record
                    </span>
                    <span className="text-xs font-mono font-bold text-[#E2B616] tracking-wider mt-1 block">
                      NO. {movieCd}
                    </span>
                  </div>

                  <div className="my-auto py-4">
                    <div className="w-10 h-0.5 bg-[#E2B616] mb-4"></div>
                    <h4 className="text-lg font-serif italic font-black text-white [&:not(.dark)]:text-zinc-850 uppercase leading-snug line-clamp-3">
                      {detail.movieNm}
                    </h4>
                    {detail.movieNmEn && (
                      <p className="text-[10px] text-white/30 [&:not(.dark)]:text-zinc-400 font-mono uppercase tracking-wide truncate mt-1">
                        {detail.movieNmEn}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white/40 [&:not(.dark)]:text-zinc-400 font-mono border-t border-white/5 dark:border-white/5 [&:not(.dark)]:border-zinc-200 pt-3">
                    <span className="tracking-widest">KOBIS REQ</span>
                    <span className="text-[#E2B616] font-bold">★ VERIFIED</span>
                  </div>
                </div>

                {/* Primary Content & Badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-block px-2.5 py-1 bg-[#E2B616] text-[#0A0A0B] text-[10px] font-bold uppercase tracking-wider rounded-md">
                      RANK {formattedRank}
                    </span>
                    
                    {detail.genres.map((g, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/5 border border-white/10 text-white/70 dark:bg-white/5 dark:border-white/10 dark:text-white/70 [&:not(.dark)]:bg-zinc-100/60 [&:not(.dark)]:border-zinc-200 [&:not(.dark)]:text-zinc-650"
                      >
                        {g.genreNm}
                      </span>
                    ))}
                    
                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/5 border border-white/10 text-[#E2B616] dark:bg-white/5 dark:border-white/10 dark:text-[#E2B616] [&:not(.dark)]:bg-amber-100/30 [&:not(.dark)]:border-amber-200 [&:not(.dark)]:text-amber-700">
                      {detail.typeNm}
                    </span>
                  </div>

                  <h2 className="font-serif italic font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white [&:not(.dark)]:text-zinc-900 leading-tight">
                    {detail.movieNm}
                  </h2>
                  
                  {detail.movieNmEn && (
                    <p className="text-sm text-white/40 [&:not(.dark)]:text-zinc-500 mt-2 font-mono tracking-wider uppercase font-medium">
                      {detail.movieNmEn} {detail.movieNmOg ? `(Orig: ${detail.movieNmOg})` : ""}
                    </p>
                  )}

                  {/* Quick Specs Grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-t border-white/10 dark:border-white/10 [&:not(.dark)]:border-zinc-200 pt-6 mt-6">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-white/30 dark:text-white/30 [&:not(.dark)]:text-zinc-400 mb-1 font-mono font-bold">
                        Director / 감독
                      </h4>
                      <p className="text-sm font-semibold text-white/90 [&:not(.dark)]:text-zinc-800">
                        {detail.directors && detail.directors.length > 0 
                          ? detail.directors.map(dir => dir.peopleNm).join(", ") 
                          : "정보 없음"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-white/30 dark:text-white/30 [&:not(.dark)]:text-zinc-400 mb-1 font-mono font-bold">
                        Runtime / 상영식
                      </h4>
                      <p className="text-sm font-semibold text-white/90 [&:not(.dark)]:text-zinc-800 font-mono">
                        {detail.showTm ? `${detail.showTm}분` : "정보 없음"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-white/30 dark:text-white/30 [&:not(.dark)]:text-zinc-400 mb-1 font-mono font-bold">
                        Age Classification / 등급
                      </h4>
                      <div className="mt-0.5">
                        {detail.audits && detail.audits.length > 0 ? (
                          <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-bold ${getAuditBadgeStyles(detail.audits[0].watchGradeNm)}`}>
                            {detail.audits[0].watchGradeNm}
                          </span>
                        ) : (
                          <span className="text-xs text-white/30 [&:not(.dark)]:text-zinc-400">심의 대기 중</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-white/30 dark:text-white/30 [&:not(.dark)]:text-zinc-400 mb-1 font-mono font-bold">
                        Country / 제작 국가
                      </h4>
                      <p className="text-sm font-semibold text-white/90 [&:not(.dark)]:text-zinc-800">
                        {detail.nations && detail.nations.length > 0 ? detail.nations.map(n => n.nationNm).join(", ") : "정보 없음"}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Company & Associations details */}
              {detail.companys && detail.companys.length > 0 && (
                <div className="space-y-3 bg-white/5 dark:bg-white/5 [&:not(.dark)]:bg-zinc-150/40 p-4 rounded-xl border border-white/5 dark:border-white/5 [&:not(.dark)]:border-zinc-200/50">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#E2B616] font-bold font-mono">
                    Production & Distribution / 제작·배급사
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.companys.map((com, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-white/5 dark:bg-white/5 [&:not(.dark)]:bg-white border border-white/10 dark:border-white/10 [&:not(.dark)]:border-zinc-200 text-white/80 [&:not(.dark)]:text-zinc-700">
                        <Landmark className="w-3 h-3 text-[#E2B616] shrink-0" />
                        <span>{com.companyNm}</span>
                        <span className="text-[10px] text-white/30 dark:text-white/30 [&:not(.dark)]:text-zinc-450 font-mono uppercase">
                          ({com.companyPartNm})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast Members section */}
              <div className="space-y-4">
                <h3 className="font-serif italic font-semibold text-lg text-white [&:not(.dark)]:text-zinc-900 border-b border-white/10 dark:border-white/10 [&:not(.dark)]:border-zinc-200 pb-2">
                  Cast Members / 출연진
                </h3>

                {detail.actors && detail.actors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {detail.actors.slice(0, 9).map((actor, idx) => (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-lg bg-white/5 dark:bg-white/5 [&:not(.dark)]:bg-white border border-white/5 dark:border-white/5 [&:not(.dark)]:border-zinc-200/60 hover:border-white/10 dark:hover:border-white/10 transition-all"
                      >
                        <span className="font-semibold text-sm text-white [&:not(.dark)]:text-zinc-800 block">
                          {actor.peopleNm}
                        </span>
                        {actor.cast ? (
                          <span className="text-xs text-[#E2B616] mt-0.5 block">
                            {actor.cast} 역
                          </span>
                        ) : (
                          <span className="text-[11px] text-white/40 [&:not(.dark)]:text-zinc-500 mt-0.5 block">
                            주연 / 출연
                          </span>
                        )}
                        {actor.peopleNmEn && (
                          <span className="text-[10px] text-white/30 dark:text-white/30 [&:not(.dark)]:text-zinc-400 mt-1 block font-mono">
                            {actor.peopleNmEn}
                          </span>
                        )}
                      </div>
                    ))}
                    {detail.actors.length > 9 && (
                      <div className="col-span-full text-center text-[11px] text-white/30 dark:text-white/30 [&:not(.dark)]:text-zinc-450 pt-2 font-mono">
                        AND {detail.actors.length - 9} OTHER RECORDED CAST MEMBERS...
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 [&:not(.dark)]:text-zinc-500 italic py-2">
                    해당 영화에 등록된 출연지 정보가 부족하거나 공란 상태입니다.
                  </p>
                )}
              </div>

              {/* Dates & Records */}
              <div className="text-white/30 dark:text-white/30 [&:not(.dark)]:text-zinc-450 text-[10px] font-mono tracking-wider flex flex-wrap items-center justify-between border-t border-white/5 dark:border-white/5 [&:not(.dark)]:border-zinc-200/60 pt-6">
                <span>DATABASE REF: {detail.source || "KOBIS OPEN API"}</span>
                <span className="flex items-center text-[#E2B616]">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  STATION SYNCHRONIZED
                </span>
              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
