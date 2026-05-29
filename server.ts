import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

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
      const apiUrl = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${key}&targetDt=${date}`;
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
      const apiUrl = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${key}&movieCd=${movieCd}`;
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting production server with static hosting...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
