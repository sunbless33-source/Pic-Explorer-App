/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Camera,
  FolderOpen,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Search,
  CheckCircle,
  X,
  BookOpen,
} from 'lucide-react';
import { CameraModal } from './components/CameraModal';
import { PatternResultCard } from './components/PatternResultCard';
import { SamplePicker } from './components/SamplePicker';
import { LoadingBanner } from './components/LoadingBanner';
import { processImageFile } from './utils/imageCompressor';
import { SamplePattern } from './utils/sampleImages';
import { PatternAnalysisResult } from './types';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imageSourceName, setImageSourceName] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PatternAnalysisResult | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [showPatternGuide, setShowPatternGuide] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const directCameraInputRef = useRef<HTMLInputElement>(null);

  // File upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      setAnalysisResult(null);
      setSelectedSampleId(null);
      setImageSourceName(file.name);

      const processed = await processImageFile(file);
      setSelectedImage(processed.base64);
      setImageMimeType(processed.mimeType);
    } catch (err) {
      setErrorMessage('사진을 읽어오지 못했어요. 다른 사진을 골라보세요!');
    }
  };

  // Sample photo selection
  const handleSelectSample = (sample: SamplePattern, dataUrl: string) => {
    setErrorMessage(null);
    setAnalysisResult(null);
    setSelectedImage(dataUrl);
    setImageMimeType('image/jpeg');
    setImageSourceName(sample.title);
    setSelectedSampleId(sample.id);
  };

  // Camera capture callback
  const handleCameraCapture = (dataUrl: string) => {
    setIsCameraOpen(false);
    setErrorMessage(null);
    setAnalysisResult(null);
    setSelectedSampleId(null);
    setImageSourceName('카메라로 찍은 사진');
    setSelectedImage(dataUrl);
    setImageMimeType('image/jpeg');
  };

  // Drag and drop handler
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        setErrorMessage(null);
        setAnalysisResult(null);
        setSelectedSampleId(null);
        setImageSourceName(file.name);
        const processed = await processImageFile(file);
        setSelectedImage(processed.base64);
        setImageMimeType(processed.mimeType);
      } catch (err) {
        setErrorMessage('사진을 읽어오지 못했어요. 다시 시도해 주세요!');
      }
    }
  };

  // Reset to choose a new photo
  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMessage(null);
    setSelectedSampleId(null);
    setImageSourceName('');
  };

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
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
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      const message = err instanceof Error ? err.message : 'AI 규칙 탐정이 사진을 살펴보는 중에 멈칫했어요. 다시 한번 눌러보세요!';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-gradient-to-b from-amber-50/90 via-sky-50/40 to-orange-50/90 text-gray-900 flex flex-col justify-between overflow-x-hidden">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* Tablet/Mobile direct camera input */}
      <input
        ref={directCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Camera Live Viewfinder Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Pattern Guide Modal (Non-intrusive popup for tablets) */}
      {showPatternGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl p-5 sm:p-6 border-3 border-amber-300 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-kid flex items-center gap-2">
                <span>📚</span> 1학년 수학: 어떤 규칙들이 있을까요?
              </h2>
              <button
                onClick={() => setShowPatternGuide(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 font-bold"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm max-h-[65vh] overflow-y-auto">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                <p className="font-black text-rose-900 font-kid text-base">🎨 색깔 규칙</p>
                <p className="font-bold text-rose-700 mt-0.5">빨강 - 파랑 - 빨강 - 파랑</p>
                <p className="text-[11px] text-gray-500 mt-1">색이 번갈아 나와요</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="font-black text-emerald-900 font-kid text-base">🔷 모양 규칙</p>
                <p className="font-bold text-emerald-700 mt-0.5">세모 - 동그라미 - 세모</p>
                <p className="text-[11px] text-gray-500 mt-1">모양이 반복돼요</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                <p className="font-black text-purple-900 font-kid text-base">📏 크기 규칙</p>
                <p className="font-bold text-purple-700 mt-0.5">큰 곰 - 작은 곰 - 큰 곰</p>
                <p className="text-[11px] text-gray-500 mt-1">크기가 달라져요</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="font-black text-amber-900 font-kid text-base">🔀 순서 규칙</p>
                <p className="font-bold text-amber-700 mt-0.5">사과 - 바나나 - 사과</p>
                <p className="text-[11px] text-gray-500 mt-1">순서대로 놓여요</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 sm:col-span-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <p className="font-black text-blue-900 font-kid text-base flex items-center gap-1.5">
                    <span>🔢 숫자 규칙</span>
                    <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">일정한 수만큼 쏙쏙!</span>
                  </p>
                  <span className="text-[11px] text-blue-600 font-bold">사물함 번호, 번호표 등</span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-center">
                  <div className="bg-white/90 p-1.5 rounded-xl border border-blue-100 shadow-2xs">
                    <span className="font-extrabold text-blue-800 text-xs sm:text-sm">1, 2, 3, 4</span>
                    <p className="text-[11px] text-blue-600 font-bold mt-0.5">1씩 커지는 규칙</p>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded-xl border border-blue-100 shadow-2xs">
                    <span className="font-extrabold text-blue-800 text-xs sm:text-sm">2, 4, 6, 8</span>
                    <p className="text-[11px] text-blue-600 font-bold mt-0.5">2씩 커지는 규칙</p>
                  </div>
                  <div className="bg-white/90 p-1.5 rounded-xl border border-blue-100 shadow-2xs">
                    <span className="font-extrabold text-blue-800 text-xs sm:text-sm">10, 8, 6, 4</span>
                    <p className="text-[11px] text-blue-600 font-bold mt-0.5">2씩 작아지는 규칙</p>
                  </div>
                </div>
                <p className="text-[11px] text-blue-700/80 mt-1.5 font-bold">
                  사물함 번호나 번호표처럼 숫자가 일정한 수만큼 커지거나 작아져요.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPatternGuide(false)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-xl text-base shadow cursor-pointer font-kid"
            >
              알겠어요! 닫기
            </button>
          </div>
        </div>
      )}

      {/* Compact Top Header for Tablet & Desktop */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b-2 border-amber-300 sticky top-0 z-30 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-2 sm:py-2.5 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-400 flex items-center justify-center shadow-xs border border-white text-xl sm:text-2xl">
              🔍
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-amber-950 font-kid tracking-tight">
                AI와 함께 하는 규칙 탐험
              </h1>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs sm:text-sm font-black rounded-full shrink-0">
                퇴계원초1-1
              </span>
            </div>
          </div>

          {/* Quick guide toggle button */}
          <button
            onClick={() => setShowPatternGuide(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs sm:text-sm lg:text-base transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            <span>우리가 찾을 수 있는 규칙</span>
          </button>
        </div>
      </header>

      {/* Main Layout (Side-by-Side on Tablet/Desktop, Clean Stacking on Mobile, Full Monitor Utilization) */}
      <main className="w-full flex-1 min-h-0 px-3 sm:px-6 lg:px-8 xl:px-10 py-2 sm:py-2.5 lg:py-3.5 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5 xl:gap-6 items-stretch w-full flex-1 min-h-0">
          
          {/* LEFT COLUMN: Photo Input & Preview & Big Action Button (md:col-span-5) */}
          <section className="md:col-span-5 flex flex-col h-full min-h-0">
            <div className="bg-white rounded-3xl p-3.5 sm:p-4 lg:p-5 xl:p-6 shadow-md border-3 border-amber-300 flex flex-col justify-between h-full min-h-0 gap-2.5 sm:gap-3 lg:gap-4">
              
              {/* Photo Source Buttons Row (Identical 50/50 Width, Never Truncated) */}
              <div className="shrink-0 grid grid-cols-2 gap-2 sm:gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 lg:py-4 px-2 lg:px-4 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm md:text-base lg:text-lg rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition cursor-pointer border border-sky-200"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 shrink-0" />
                  <span className="whitespace-nowrap shrink-0">사진 찍기</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3.5 lg:py-4 px-2 lg:px-4 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm md:text-base lg:text-lg rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition cursor-pointer border border-emerald-200"
                >
                  <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 shrink-0" />
                  <span className="whitespace-nowrap shrink-0">사진 고르기</span>
                </button>
              </div>

              {/* Photo Preview / Drop Zone (Responsive height that flexes gracefully on tall desktop monitors) */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed transition-all p-2 text-center flex-1 min-h-[170px] sm:min-h-[200px] lg:min-h-[240px] flex flex-col items-center justify-center overflow-hidden ${
                  selectedImage
                    ? 'border-amber-400 bg-amber-50/60'
                    : 'border-amber-300 bg-amber-50/30 hover:bg-amber-50/70 cursor-pointer'
                }`}
                onClick={() => {
                  if (!selectedImage) fileInputRef.current?.click();
                }}
              >
                {selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="선택된 규칙 사진"
                      className="max-h-full max-w-full rounded-xl shadow-xs border border-white object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 shadow-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">{imageSourceName || '사진 준비 완료'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-full shadow-xs text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="사진 변경"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs">바꾸기</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 pointer-events-none">
                    <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl block animate-bounce-gentle">📷</span>
                    <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-amber-950 font-kid">
                      여기를 눌러 사진을 올려보세요!
                    </p>
                    <p className="text-xs sm:text-sm lg:text-base text-amber-800 font-bold">
                      블록, 바둑알, 과일을 줄 세워 찰칵!
                    </p>
                  </div>
                )}
              </div>

              {/* Big "규칙 찾아보기" Button (Always visible on left panel) */}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleAnalyzePattern}
                className={`shrink-0 w-full py-3 sm:py-3.5 lg:py-4.5 xl:py-5 px-4 font-black text-xl sm:text-2xl lg:text-3xl xl:text-4xl rounded-2xl shadow-lg transition cursor-pointer border-2 border-white flex items-center justify-center gap-2 ${
                  selectedImage && !isLoading
                    ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-amber-950 active:scale-98 animate-pulse-soft'
                    : 'bg-amber-200 text-amber-800/70 cursor-not-allowed opacity-90'
                }`}
              >
                <Search className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 shrink-0" />
                <span>규칙 찾아보기! 🔍</span>
              </button>

              {/* Compact Sample Picker */}
              <div className="shrink-0">
                <SamplePicker
                  onSelectSample={handleSelectSample}
                  selectedId={selectedSampleId}
                />
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: AI Analysis Results / Waiting State / Standby Guidance (md:col-span-7) */}
          <section className="md:col-span-7 flex flex-col h-full min-h-0">
            {/* 1. Loading State during Gemini AI Analysis */}
            {isLoading && (
              <div className="h-full min-h-0 flex flex-col">
                <LoadingBanner />
              </div>
            )}

            {/* 2. Error Message */}
            {errorMessage && !isLoading && (
              <div className="w-full bg-rose-50 rounded-3xl p-5 sm:p-6 lg:p-8 border-3 border-rose-300 shadow-md flex items-start gap-3.5 my-auto">
                <span className="text-3xl sm:text-4xl">⚠️</span>
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-rose-950 font-kid">
                    앗! 문제가 생겼어요!
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-rose-800">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={handleAnalyzePattern}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm sm:text-base shadow cursor-pointer mt-1"
                  >
                    다시 시도하기
                  </button>
                </div>
              </div>
            )}

            {/* 3. Analysis Result Card */}
            {analysisResult && !isLoading && (
              <PatternResultCard result={analysisResult} onReset={handleReset} />
            )}

            {/* 4. Standby Guide when no analysis result yet */}
            {!isLoading && !errorMessage && !analysisResult && (
              <div className="w-full bg-white rounded-3xl p-4 sm:p-5 lg:p-6 xl:p-7 shadow-md border-3 border-amber-300 flex flex-col justify-between h-full min-h-0 gap-3 lg:gap-4 xl:gap-5">
                <div className="shrink-0 flex items-center gap-3 border-b border-amber-100 pb-2.5 lg:pb-3.5">
                  <span className="text-2xl sm:text-3xl lg:text-4xl animate-bounce-gentle">🤖</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-amber-950 font-kid">
                      AI와 함께 하는 규칙 탐험
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold text-gray-600">
                      사진 속에서 반복되는 멋진 규칙을 찾아드려요!
                    </p>
                  </div>
                </div>

                {/* 3 Step Instruction for 1st Graders */}
                <div className="flex-1 min-h-0 flex flex-col justify-around gap-2 sm:gap-2.5 lg:gap-3.5">
                  <div className="flex items-center gap-3 p-2.5 sm:p-3 lg:p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center shrink-0 text-sm sm:text-base lg:text-lg font-kid">
                      1
                    </span>
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold text-gray-800">
                      왼쪽에서 <strong>‘사진 찍기’</strong>나 <strong>‘연습사진’</strong>을 선택해요.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 sm:p-3 lg:p-4 bg-orange-50 rounded-2xl border border-orange-200">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full bg-orange-400 text-orange-950 font-black flex items-center justify-center shrink-0 text-sm sm:text-base lg:text-lg font-kid">
                      2
                    </span>
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold text-gray-800">
                      노란색 큰 <strong>‘규칙 찾아보기!’</strong> 버튼을 꾹 눌러요.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 sm:p-3 lg:p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full bg-emerald-400 text-emerald-950 font-black flex items-center justify-center shrink-0 text-sm sm:text-base lg:text-lg font-kid">
                      3
                    </span>
                    <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold text-gray-800">
                      AI 규칙 탐정이 규칙을 설명해 주고 재미있는 퀴즈도 내줘요!
                    </p>
                  </div>
                </div>

                {/* Mini Preview of Rules */}
                <div className="shrink-0 pt-1">
                  <p className="text-xs sm:text-sm lg:text-base font-black text-amber-900 font-kid mb-1.5 sm:mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                    <span>이런 규칙들을 찾을 수 있어요:</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5 lg:gap-3 text-center">
                    <div className="p-2 sm:p-2.5 lg:p-3 xl:p-4 bg-rose-50 rounded-2xl border border-rose-200">
                      <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">🎨</span>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-rose-900 font-kid mt-0.5">색깔 규칙</p>
                    </div>
                    <div className="p-2 sm:p-2.5 lg:p-3 xl:p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">🔷</span>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-emerald-900 font-kid mt-0.5">모양 규칙</p>
                    </div>
                    <div className="p-2 sm:p-2.5 lg:p-3 xl:p-4 bg-purple-50 rounded-2xl border border-purple-200">
                      <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">📏</span>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-purple-900 font-kid mt-0.5">크기 규칙</p>
                    </div>
                    <div className="p-2 sm:p-2.5 lg:p-3 xl:p-4 bg-amber-50 rounded-2xl border border-amber-200">
                      <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">🔀</span>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-amber-900 font-kid mt-0.5">순서 규칙</p>
                    </div>
                    <div className="p-2 sm:p-2.5 lg:p-3 xl:p-4 bg-blue-50 rounded-2xl border border-blue-200 col-span-2 sm:col-span-1 md:col-span-1">
                      <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">🔢</span>
                      <p className="text-xs sm:text-sm lg:text-base font-black text-blue-900 font-kid mt-0.5">숫자 규칙</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Compact Footer */}
      <footer className="shrink-0 text-center py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-amber-800/70 border-t border-amber-200/50 bg-white/40 w-full">
        숨어 있는 규칙을 찾고 새로운 규칙을 만들어 가는 즐거운 수학 탐험
      </footer>
    </div>
  );
}
