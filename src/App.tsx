// Analyze pattern using Gemini AI directly from frontend
  const handleAnalyzePattern = async () => {
    if (isLoading) return;
    if (!selectedImage) {
      setErrorMessage('먼저 사진을 찍거나 골라주세요!');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setErrorMessage('Gemini API 키가 설정되지 않았습니다. Vercel 환경 변수를 확인해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    try {
      const base64Data = selectedImage.includes(',') 
        ? selectedImage.split(',')[1] 
        : selectedImage;

      const prompt = `초등학교 1학년 수학 '규칙 찾기' 단원에 맞춰 이 사진을 분석해 주세요.
반드시 아래의 JSON 형식으로만 응답해 주세요. 다른 설명 텍스트나 마크다운은 포함하지 마세요.
{
  "patternType": "색깔 규칙 또는 모양 규칙 또는 크기 규칙 또는 순서 규칙 또는 숫자 규칙 중 하나",
  "title": "아이들이 이해하기 쉬운 친근한 제목",
  "description": "어떤 규칙이 숨어 있는지 1학년 눈높이에 맞춰 다정하게 설명",
  "unitName": "수학 1학년 2학기 규칙 단원",
  "quiz": {
    "question": "다음 순서에 올 알맞은 것은?",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "correctIndex": 0,
    "explanation": "정답인 이유 설명"
  }
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: imageMimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '규칙을 살펴보는 중에 멈칫했어요.');
      }

      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('AI로부터 올바른 응답을 받지 못했어요.');
      }

      const parsedResult = JSON.parse(candidateText);
      setAnalysisResult(parsedResult);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message || 'AI 규칙 탐정이 사진을 살펴보는 중에 멈칫했어요. 다시 한번 눌러보세요!'
      );
    } finally {
      setIsLoading(false);
    }
  };
