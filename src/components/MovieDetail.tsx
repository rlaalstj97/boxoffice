import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, Clock, Calendar, Globe, Award, Sparkles, 
  Users, Landmark, ChevronLeft, AlertCircle, HelpCircle, Loader2, Play,
  Edit3, Copy, Check
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

  const [keywords, setKeywords] = useState<string[]>(["", "", ""]);
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Reset review state when selected movie changes
  useEffect(() => {
    setKeywords(["", "", ""]);
    setGeneratedReview(null);
    setReviewLoading(false);
    setReviewError(null);
  }, [movieCd]);

  const handleKeywordChange = (index: number, value: string) => {
    const updated = [...keywords];
    updated[index] = value;
    setKeywords(updated);
  };

  const handleGenerateReview = async () => {
    if (!detail) return;
    if (keywords.some(k => !k.trim())) {
      setReviewError("3개의 키워드를 모두 입력해 주세요.");
      return;
    }
    
    setReviewLoading(true);
    setReviewError(null);
    setCopied(false);
    
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieNm: detail.movieNm,
          genres: detail.genres.map(g => g.genreNm).join(", "),
          keywords: keywords.map(k => k.trim())
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "감상평 생성에 실패했습니다.");
      }
      
      setGeneratedReview(data.review);
    } catch (err: any) {
      console.error("Review generation error:", err);
      setReviewError(err.message || "감상평을 가져오는 데 문제가 발생했습니다.");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedReview) return;
    navigator.clipboard.writeText(generatedReview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-[#FFFFFF] to-[#F4F4F5] dark:from-[#0A0A0B] dark:to-[#1A1A1C]">
      
      {/* Background Giant Watermark (Signature of Sophisticated Dark Theme) */}
      {detail && (
        <div className="absolute -top-12 -right-12 p-8 opacity-[0.05] dark:opacity-[0.04] pointer-events-none select-none z-0">
          <span className="text-[200px] sm:text-[320px] font-serif italic leading-none font-black text-zinc-900 dark:text-white">
            {formattedRank}
          </span>
        </div>
      )}

      {/* Mobile-back navigation banner */}
      {onClose && (
        <div className="px-4 py-3.5 border-b border-zinc-200/80 flex items-center bg-white/90 dark:bg-[#141416]/90 dark:border-white/10 z-20 md:hidden">
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
              className="h-full flex flex-col items-center justify-center text-center p-8 border border-zinc-200 rounded-2xl bg-white min-h-[400px] dark:bg-white/5 dark:border-white/10"
            >
              <div className="p-4 rounded-xl bg-zinc-100 text-[#E2B616] mb-5 ring-4 ring-zinc-50 dark:bg-white/5 dark:ring-white/5">
                <Film className="w-8 h-8" />
              </div>
              <h3 className="font-serif italic text-zinc-900 text-xl font-semibold dark:text-white">
                Select a Movie
              </h3>
              <p className="text-zinc-500 max-w-sm text-xs mt-2 leading-relaxed dark:text-white/40">
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
              <p className="text-zinc-505 text-xs tracking-wider uppercase font-mono dark:text-white/50">
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
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-zinc-900 dark:text-white">상세내역 오류</h4>
              <p className="text-zinc-500 text-xs max-w-xs mt-2 dark:text-white/40">
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
                <div className="w-full sm:w-60 h-80 bg-white border border-zinc-300 rounded-xl flex-shrink-0 flex flex-col justify-between p-5 relative overflow-hidden shadow-xl shadow-zinc-200 dark:bg-[#141416] dark:border-white/15 dark:shadow-black/30">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E2B616]"></div>
                  
                  <div className="text-left py-2">
                    <span className="text-[10px] font-serif italic text-zinc-400 block tracking-widest uppercase dark:text-white/40">
                      Official Record
                    </span>
                    <span className="text-xs font-mono font-bold text-[#E2B616] tracking-wider mt-1 block">
                      NO. {movieCd}
                    </span>
                  </div>

                  <div className="my-auto py-4">
                    <div className="w-10 h-0.5 bg-[#E2B616] mb-4"></div>
                    <h4 className="text-lg font-serif italic font-black text-zinc-850 uppercase leading-snug line-clamp-3 dark:text-white">
                      {detail.movieNm}
                    </h4>
                    {detail.movieNmEn && (
                      <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide truncate mt-1 dark:text-white/30">
                        {detail.movieNmEn}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono border-t border-zinc-250 pt-3 dark:text-white/40 dark:border-white/5">
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
                        className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-zinc-100 border border-zinc-200 text-zinc-650 dark:bg-white/5 dark:border-white/10 dark:text-white/70"
                      >
                        {g.genreNm}
                      </span>
                    ))}
                    
                    <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-amber-100/30 border border-amber-200 text-amber-700 dark:bg-white/5 dark:border-white/10 dark:text-[#E2B616]">
                      {detail.typeNm}
                    </span>
                  </div>

                  <h2 className="font-serif italic font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-zinc-900 leading-tight dark:text-white">
                    {detail.movieNm}
                  </h2>
                  
                  {detail.movieNmEn && (
                    <p className="text-sm text-zinc-500 mt-2 font-mono tracking-wider uppercase font-medium dark:text-white/40">
                      {detail.movieNmEn} {detail.movieNmOg ? `(Orig: ${detail.movieNmOg})` : ""}
                    </p>
                  )}

                  {/* Quick Specs Grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-t border-zinc-200 pt-6 mt-6 dark:border-white/10">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-mono font-bold dark:text-white/30">
                        Director / 감독
                      </h4>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-white/90">
                        {detail.directors && detail.directors.length > 0 
                          ? detail.directors.map(dir => dir.peopleNm).join(", ") 
                          : "정보 없음"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-[#E2B616]/70 mb-1 font-mono font-bold dark:text-[#E2B616]/90">
                        Runtime / 상영식
                      </h4>
                      <p className="text-sm font-semibold text-zinc-800 font-mono dark:text-white/90">
                        {detail.showTm ? `${detail.showTm}분` : "정보 없음"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-mono font-bold dark:text-white/30">
                        Age Classification / 등급
                      </h4>
                      <div className="mt-0.5">
                        {detail.audits && detail.audits.length > 0 ? (
                          <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-bold ${getAuditBadgeStyles(detail.audits[0].watchGradeNm)}`}>
                            {detail.audits[0].watchGradeNm}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-white/30">심의 대기 중</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1 font-mono font-bold dark:text-white/30">
                        Country / 제작 국가
                      </h4>
                      <p className="text-sm font-semibold text-zinc-805 dark:text-white/90">
                        {detail.nations && detail.nations.length > 0 ? detail.nations.map(n => n.nationNm).join(", ") : "정보 없음"}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Company & Associations details */}
              {detail.companys && detail.companys.length > 0 && (
                <div className="space-y-3 bg-zinc-150/45 p-4 rounded-xl border border-zinc-200/50 dark:bg-white/5 dark:border-white/5">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#E2B616] font-bold font-mono">
                    Production & Distribution / 제작·배급사
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.companys.map((com, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-white border border-zinc-200 text-zinc-700 dark:bg-[#141416] dark:border-white/10 dark:text-white/80">
                        <Landmark className="w-3 h-3 text-[#E2B616] shrink-0" />
                        <span>{com.companyNm}</span>
                        <span className="text-[10px] text-zinc-450 font-mono uppercase dark:text-white/30">
                          ({com.companyPartNm})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast Members section */}
              <div className="space-y-4">
                <h3 className="font-serif italic font-semibold text-lg text-zinc-910 border-b border-zinc-200 pb-2 dark:text-white dark:border-white/10">
                  Cast Members / 출연진
                </h3>

                {detail.actors && detail.actors.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {detail.actors.slice(0, 9).map((actor, idx) => (
                      <div 
                        key={idx} 
                        className="p-3.5 rounded-lg bg-white border border-zinc-200/60 transition-all dark:bg-[#141416]/50 dark:border-white/5 dark:hover:border-white/10"
                      >
                        <span className="font-semibold text-sm text-zinc-800 block dark:text-white">
                          {actor.peopleNm}
                        </span>
                        {actor.cast ? (
                          <span className="text-xs text-[#E2B616] mt-0.5 block">
                            {actor.cast} 역
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500 mt-0.5 block dark:text-white/40">
                            주연 / 출연
                          </span>
                        )}
                        {actor.peopleNmEn && (
                          <span className="text-[10px] text-zinc-400 mt-1 block font-mono dark:text-white/30">
                            {actor.peopleNmEn}
                          </span>
                        )}
                      </div>
                    ))}
                    {detail.actors.length > 9 && (
                      <div className="col-span-full text-center text-[11px] text-zinc-450 pt-2 font-mono dark:text-white/30">
                        AND {detail.actors.length - 9} OTHER RECORDED CAST MEMBERS...
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-2 dark:text-white/40">
                    해당 영화에 등록된 출연지 정보가 부족하거나 공란 상태입니다.
                  </p>
                )}
              </div>

              {/* AI Review Generator Section */}
              <div className="space-y-4 bg-amber-50/20 border border-amber-500/20 p-5 sm:p-6 rounded-xl dark:bg-amber-950/5 dark:border-amber-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 text-[#E2B616] rounded-lg dark:bg-amber-900/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif italic font-bold text-base text-zinc-900 dark:text-white">
                        AI Keyword Review Creator / AI 감상평 작성기
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5 dark:text-white/40">
                        영화에 어울리는 3가지 키워드를 입력하시면 맞춤형 고품격 감상평을 특별히 집필해 드립니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {keywords.map((kw, idx) => (
                    <div key={idx} className="relative" id={`kw-container-${idx}`}>
                      <span className="absolute left-3 top-2.5 text-[10px] font-bold text-[#E2B616] tracking-wider uppercase">
                        KW0{idx + 1}
                      </span>
                      <input
                        id={`kw-input-${idx}`}
                        type="text"
                        value={kw}
                        onChange={(e) => handleKeywordChange(idx, e.target.value)}
                        placeholder={`키워드 ${idx + 1}`}
                        className="w-full pl-14 pr-3 py-2.5 bg-white border border-zinc-250 rounded-lg text-sm font-semibold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#E2B616] focus:border-[#E2B616] dark:bg-[#141416]/50 dark:border-white/10 dark:text-white dark:placeholder-zinc-650"
                        maxLength={15}
                      />
                    </div>
                  ))}
                </div>

                {reviewError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium" id="review-error-box">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    id="generate-review-btn"
                    onClick={handleGenerateReview}
                    disabled={reviewLoading}
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-[#E2B616] text-[#0A0A0B] text-xs font-bold uppercase tracking-wider rounded-lg hover:brightness-110 active:scale-97 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {reviewLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        감상평 작성 중...
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5 mr-2" />
                        AI 감상평 작성하기
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Output Display */}
                <AnimatePresence>
                  {generatedReview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                      id="review-output-animate"
                    >
                      <div className="mt-4 p-4 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-white/5 dark:border-white/5 relative group" id="review-output-box">
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            id="copy-review-btn"
                            onClick={handleCopy}
                            className="p-1.5 rounded bg-white hover:bg-zinc-100 dark:bg-[#141416] dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-800 dark:text-white/40 dark:hover:text-white transition-all cursor-pointer border border-zinc-200/50 dark:border-white/5"
                            title="클립보드에 복사"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#E2B616] mb-1.5 font-mono">
                          AI Generated Review
                        </div>
                        <p className="text-sm font-medium text-zinc-850 leading-relaxed pr-10 dark:text-zinc-300">
                          {generatedReview}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Dates & Records */}
              <div className="text-zinc-450 text-[10px] font-mono tracking-wider flex flex-wrap items-center justify-between border-t border-zinc-200/60 pt-6 dark:text-white/30 dark:border-white/5">
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
