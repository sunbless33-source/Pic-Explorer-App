import express from 'express';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable gzip/brotli compression for fast network payload transfer
app.use(compression());

// Keep-alive headers for stable reverse-proxy connection in Cloud Run / Nginx
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=65');
  next();
});

// Allow large image uploads (photos from camera/tablet)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for analyzing math patterns in photos
app.post('/api/analyze-pattern', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: '사진을 먼저 골라주세요! 찰칵 찍거나 사진을 올려주세요.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: '인공지능 연결 키(GEMINI_API_KEY)가 설정되지 않았어요.',
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+]+;base64,/i, '');

    const systemPrompt = `당신은 대한민국 초등학교 1학년을 위한 친절한 'AI 규칙 탐정'입니다.
현재 초등학교 1학년 수학의 '규칙 찾기' 단원 수업을 진행하고 있습니다.
학생이 태블릿이나 카메라로 찍은 실물 사진을 꼼꼼하게 관찰하고, 색깔, 모양, 크기, 순서, 그리고 '숫자 규칙'을 찾아주세요.

[탐정이 찾을 수 있는 핵심 규칙 5가지]
1. 색깔 규칙: 색깔이 일정하게 반복돼요 (예: 빨강-파랑-빨강-파랑)
2. 모양 규칙: 모양이 일정하게 반복돼요 (예: 세모-네모-동그라미-세모-네모-동그라미)
3. 크기 규칙: 크기가 일정하게 번갈아 나와요 (예: 큰 곰-작은 곰-큰 곰-작은 곰)
4. 순서 규칙: 사물이나 과일 등이 일정한 순서로 반복돼요 (예: 사과-바나나-사과-바나나)
5. 숫자 규칙: 사물함 번호, 번호표, 숫자 카드, 번호판, 숫자 배열 등 숫자가 일정한 수만큼 커지거나 작아지는 규칙
   - 1씩 커지는 규칙 (예: 1, 2, 3, 4)
   - 2씩 커지는 규칙 (예: 2, 4, 6, 8)
   - 2씩 작아지는 규칙 (예: 10, 8, 6, 4)
   - 1씩 작아지는 규칙 (예: 5, 4, 3, 2)
   - 일정한 숫자가 반복되는 규칙 (예: 1, 2, 1, 2)

[사진 속 숫자 규칙 파악 및 설명 상세 지침]
- 사진에 사물함 번호, 번호표, 숫자 배열 등이 보이면 숫자를 읽고 물건들의 배치 방향(예: 왼쪽에서 오른쪽으로 갈수록, 위에서 아래로 갈수록 등)과 순서를 파악하여 설명하세요.
  * 예시: 사물함 번호가 왼쪽에서 오른쪽으로 1, 2, 3, 4로 배열되어 있다면
    - ruleType: "숫자 규칙"
    - shortExplanation: "오른쪽으로 갈수록 숫자가 1씩 커져요."
    - detailedExplanation: "1 다음은 2, 2 다음은 3, 3 다음은 4로 1씩 더 커지는 멋진 숫자 규칙이에요!"
    - patternUnit: ["1씩 커짐"] 또는 반복 숫자마디
    - sequenceItems: [{ name: "1", symbol: "1️⃣" }, { name: "2", symbol: "2️⃣" }, { name: "3", symbol: "3️⃣" }, { name: "4", symbol: "4️⃣" }]
    - nextItem: "5" (또는 "5번")
    - nextItemSymbol: "5️⃣"
    - quizOptions: ["5", "6", "3"]
    - quizCorrectIndex: 0
  * 예시: 오른쪽으로 갈수록 2, 4, 6, 8로 배열되어 있다면:
    - shortExplanation: "오른쪽으로 갈수록 숫자가 2씩 커져요."
    - nextItem: "10"
  * 예시: 10, 8, 6, 4로 배열되어 있다면:
    - shortExplanation: "오른쪽으로 갈수록 숫자가 2씩 작아져요."
    - nextItem: "2"

[매우 중요한 판정 지침 - 임의 추측 절대 금지!]
1. 확실한 반복 또는 증가/감소 규칙이 보이는 경우에만 hasPattern = true로 설정하세요.
2. [숫자 확인이 어려울 때]:
   사진에서 숫자가 흐리거나, 가려져 있거나, 글씨가 너무 작아 잘 보이지 않거나, 배열 순서(위치)를 확실히 알 수 없으면 절대로 임의로 추측하지 마세요!
   이때는 반드시 hasPattern = false로 답하고 다음과 같이 안내하세요:
   - shortExplanation: "사진 속 숫자나 배열을 확인하기 어려워요."
   - detailedExplanation: "숫자가 잘 보이지 않거나 순서가 확실하지 않아요. 숫자가 또렷하게 보이도록 다시 찍어볼까요?"
   - adviceForRetake: "사물함이나 번호표의 숫자가 크게 잘 보이도록 가까이서 정면으로 찰칵 찍어보세요!"
3. 만약 규칙이 불명확하거나, 물건들이 어질러져 있거나, 개수가 너무 적어 규칙을 알 수 없거나, 사진이 너무 어둡거나 흔들려 확실하지 않으면 절대로 억지로 규칙을 만들지 마세요! 반드시 hasPattern = false로 답해야 합니다.
4. 1학년 학생들에게 잘못된 규칙을 알려주면 안 되므로, 확실하지 않을 때는 친절하고 솔직하게 "규칙을 찾기 어려워요"라고 안내하고, 다시 예쁘게 찍을 수 있는 방법을 따뜻하게 알려주세요.

[문장 작성 규칙]
- 초등학교 1학년(7~8세)이 한눈에 쏙 이해할 수 있는 아주 쉽고 짧은 한국어 문장(해요체).
- 짧은 설명 예시: "오른쪽으로 갈수록 숫자가 1씩 커져요.", "빨간색 다음에 파란색이 나와요. 이 순서가 반복되고 있어요."
- 절대 어려운 한자어나 어려운 수학 용어(등차수열, 공차, 시퀀스, 주기 등)를 쓰지 말고, 교과서 표현인 "커져요", "작아져요", "마디", "규칙", "반복", "순서"를 사용하세요.`;

    const schemaConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hasPattern: {
            type: Type.BOOLEAN,
            description: '사진 속에서 명확한 2회 이상의 반복 또는 일정한 증가/감소 숫자 규칙을 확실하게 찾았는지 여부',
          },
          ruleType: {
            type: Type.STRING,
            description: '규칙의 종류 (예: 숫자 규칙, 색깔 규칙, 모양 규칙, 크기 규칙, 순서 규칙, 규칙 없음)',
          },
          shortExplanation: {
            type: Type.STRING,
            description: '1학년 학생용 1~2문장 쉬운 핵심 설명 (예: "오른쪽으로 갈수록 숫자가 1씩 커져요." 또는 "빨간색 다음에 파란색이 나와요. 이 순서가 반복되고 있어요.")',
          },
          detailedExplanation: {
            type: Type.STRING,
            description: '무엇이 어떻게 번갈아 나오거나 변하는지 조금 더 쉽게 설명한 친절한 문장',
          },
          patternUnit: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '반복되는 기본 마디 목록 (예: ["1씩 커짐"] 또는 ["빨간색 블록", "파란색 블록"])',
          },
          sequenceItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: '물체 이름 또는 숫자 (예: 1, 2, 빨간 블록)' },
                symbol: { type: Type.STRING, description: '대표 이모지 또는 숫자 기호 (예: 1️⃣, 2️⃣, 🟥, 🟦, 🟡, 🟢, 🔺 등)' },
                colorTag: { type: Type.STRING, description: '색상 계열 이름 (예: 파랑, 빨강, 노랑 등)' },
              },
              required: ['name', 'symbol'],
            },
            description: '사진에서 실제로 관찰된 순서대로의 물체/숫자 목록',
          },
          nextItem: {
            type: Type.STRING,
            description: '이 규칙대로라면 다음에 올 물체나 숫자 (예: 5, 빨간색 블록)',
          },
          nextItemSymbol: {
            type: Type.STRING,
            description: '다음에 올 물체나 숫자의 기호 (예: 5️⃣, 🟥)',
          },
          quizOptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '다음에 올 것은 무엇일까요? 객관식 보기 3개',
          },
          quizCorrectIndex: {
            type: Type.INTEGER,
            description: 'quizOptions 중 정답 인덱스 (0, 1, 2)',
          },
          adviceForRetake: {
            type: Type.STRING,
            description: '사진을 더 잘 찍기 위한 1학년 눈높이 안내 팁 (예: "사물함 번호가 잘 보이도록 가까이서 찰칵 찍어볼까요?")',
          },
          cheerMessage: {
            type: Type.STRING,
            description: '1학년 학생을 칭찬하고 격려하는 따뜻한 응원 말 (예: "우와! 멋진 규칙 탐험가예요! 참 잘했어요!")',
          },
        },
        required: [
          'hasPattern',
          'ruleType',
          'shortExplanation',
          'detailedExplanation',
          'patternUnit',
          'sequenceItems',
          'adviceForRetake',
          'cheerMessage',
        ],
      },
    };

    const imageParts = {
      parts: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          },
        },
        { text: systemPrompt },
      ],
    };

    let response;
    // Primary fast model: gemini-3.1-flash-lite (1~2 second response)
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: imageParts,
        config: schemaConfig,
      });
    } catch (liteErr: any) {
      console.warn('Flash lite failed, falling back to gemini-3.8-flash with LOW thinking:', liteErr?.message);
      // Fallback: gemini-3.8-flash with ThinkingLevel.LOW
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: imageParts,
        config: {
          ...schemaConfig,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });
    }

    const textContent = response.text?.trim() || '{}';
    const parsedData = JSON.parse(textContent);

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini pattern analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI 규칙 탐정이 사진을 살펴보는 중에 멈칫했어요. 다시 한번 눌러보세요!',
      details: error?.message || '알 수 없는 오류',
    });
  }
});

// Health check endpoint for Cloud Run and container readiness
app.get('/api/health', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite or Static file serving
const isProd = process.env.NODE_ENV === 'production';

async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');

  if (isProd && fs.existsSync(path.resolve(distPath, 'index.html'))) {
    console.log('📦 Serving pre-built static bundle from dist/');
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true,
      index: false,
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    console.log('⚡ Initializing Vite development middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Rule Explorer] Server running on http://0.0.0.0:${PORT}`);
  });

  // Socket timeouts to prevent connection drops with Cloud Run / Nginx
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

