import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(express.json());

// KOBIS API Key config
const getKobisApiKey = () => {
  return process.env.KOBIS_API_KEY || "67b4be84094e77ad7ca6482ad074230e";
};

// API Route: get daily box office
app.get("/api/boxoffice", async (req, res) => {
  try {
    const date = req.query.date as string;
    if (!date || !/^\d{8}$/.test(date)) {
      return res.status(400).json({ error: "올바른 날짜 형식이 아닙니다. YYYYMMDD 형식이어야 합니다." });
    }

    const key = getKobisApiKey();
    // Use secure HTTPS endpoint
    const apiUrl = `https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${key}&targetDt=${date}`;
    console.log(`[API] Fetching Box Office for date: ${date}`);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`KOBIS API returned status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Box Office Fetch Error:", error);
    res.status(500).json({ error: error.message || "박스오피스 데이터를 가져오는 데 실패했습니다." });
  }
});

// API Route: get movie detail
app.get("/api/movie/:movieCd", async (req, res) => {
  try {
    const { movieCd } = req.params;
    if (!movieCd) {
      return res.status(400).json({ error: "영화 코드가 필요합니다." });
    }

    const key = getKobisApiKey();
    // Use secure HTTPS endpoint
    const apiUrl = `https://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${key}&movieCd=${movieCd}`;
    console.log(`[API] Fetching Movie Detail for code: ${movieCd}`);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`KOBIS API returned status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Movie Detail Fetch Error:", error);
    res.status(500).json({ error: error.message || "영화 상세정보를 가져오는 데 실패했습니다." });
  }
});

// API Route: generate review using Gemini API based on 3 keywords
app.post("/api/review", async (req, res) => {
  try {
    const { movieNm, genres, keywords } = req.body;
    
    if (!movieNm) {
      return res.status(400).json({ error: "영화 제목이 누락되었습니다." });
    }
    
    if (!keywords || !Array.isArray(keywords) || keywords.length !== 3) {
      return res.status(400).json({ error: "정확히 3개의 감상평 키워드가 필요합니다." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "Gemini API 키가 설정되지 않았습니다. 설정 > Secrets 메뉴에서 GEMINI_API_KEY를 등록해 주세요." 
      });
    }

    console.log(`[Gemini] Lazy initializing client and generating review for ${movieNm}`);
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `영화 '${movieNm}'(장르: ${genres || '정보 없음'})에 대한 감상평을 작성해 주세요.
반드시 아래 제공된 3가지 키워드를 감상평 내용에 자연스럽게 녹여내어 포함해야 합니다:
키워드 1: ${keywords[0]}
키워드 2: ${keywords[1]}
키워드 3: ${keywords[2]}

작성 지침:
1. 영화 애호가 혹은 세련된 평론가의 어조로, 지적이면서도 공감 가는 내용으로 한글로만 작성해 주세요.
2. 각 키워드는 문맥에 흘러가듯 자연스럽게 어우러져야 하며, 억지로 끼워 넣은 문장을 피하고 전체적인 글의 흐름을 부드럽게 유지해 주세요.
3. 분량은 가독성이 훌륭한 3~4개 문장 정도로 작성해 주세요.
4. 제목이나 부가 수식어구 없이, 오직 완성된 한 문단의 세련된 감상평 본문만 출력해 주세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const reviewText = response.text || "감상평을 생성할 수 없습니다.";
    res.json({ review: reviewText.trim() });

  } catch (error: any) {
    console.error("Gemini Review Generation Error:", error);
    res.status(500).json({ error: error.message || "감상평 생성 과정에서 예상치 못한 오류가 발생했습니다." });
  }
});

export { app };
