import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Sparkles, HelpCircle, ArrowRight, CheckCircle2, RotateCcw, Lightbulb } from 'lucide-react';
import { PatternAnalysisResult } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface PatternResultCardProps {
  result: PatternAnalysisResult;
  onReset: () => void;
}

export const PatternResultCard: React.FC<PatternResultCardProps> = ({ result, onReset }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [result]);

  const toggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToRead = result.hasPattern
        ? `${result.ruleType}! ${result.shortExplanation} ${result.detailedExplanation || ''}`
        : `${result.shortExplanation} ${result.adviceForRetake || ''}`;
      speakText(textToRead, () => setIsSpeaking(false));
    }
  };

  const handleQuizSelect = (idx: number) => {
    if (quizAnswered) return;
    setSelectedQuizIdx(idx);
    setQuizAnswered(true);

    if (idx === result.quizCorrectIndex) {
      try {
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 1. When a clear pattern is found
  if (result.hasPattern) {
    const isCorrect = selectedQuizIdx === result.quizCorrectIndex;

    return (
      <div className="w-full h-full min-h-0 bg-white rounded-3xl p-3.5 sm:p-4 lg:p-5 xl:p-6 shadow-md border-3 border-amber-300 transition-all flex flex-col justify-between gap-2.5 sm:gap-3 lg:gap-4 overflow-y-auto lg:overflow-visible">
        {/* Top Header Row: Rule Badge, Title, Sound Button & Reset Button */}
        <div className="shrink-0 flex items-center justify-between gap-2 pb-2 lg:pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl lg:text-3xl animate-bounce-gentle shrink-0">🌟</span>
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="px-2 lg:px-3 py-0.5 lg:py-1 bg-amber-400 text-amber-950 text-xs lg:text-sm font-black rounded-full shrink-0">
                {result.ruleType || '반복 규칙'}
              </span>
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-amber-950 font-kid truncate">
                규칙을 찾았어요!
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
            {/* Sound Read Button */}
            <button
              type="button"
              onClick={toggleSpeak}
              className={`flex items-center gap-1 lg:gap-1.5 px-2.5 sm:px-3 lg:px-4 py-1 lg:py-1.5 rounded-full font-black text-xs sm:text-sm lg:text-base shadow-xs transition cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
              title="AI 규칙 탐정 목소리로 듣기"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> : <Volume2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-700" />}
              <span>{isSpeaking ? '멈추기' : '소리로 듣기'}</span>
            </button>

            {/* Quick Reset Button */}
            <button
              type="button"
              onClick={onReset}
              className="p-1 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs lg:text-sm rounded-full transition cursor-pointer flex items-center gap-1"
              title="다른 사진 찾기"
            >
              <RotateCcw className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">다시하기</span>
            </button>
          </div>
        </div>

        {/* 1) Rule Explanation (규칙 설명) */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6 shadow-xs flex-1 min-h-0 flex flex-col justify-center">
          <div className="flex items-start gap-2.5 lg:gap-3.5">
            <span className="text-2xl lg:text-3xl xl:text-4xl select-none shrink-0 mt-0.5">💬</span>
            <div className="space-y-1 lg:space-y-1.5 flex-1 min-w-0">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-black text-gray-900 leading-snug font-kid">
                "{result.shortExplanation}"
              </p>
              {result.detailedExplanation && (
                <p className="text-xs sm:text-sm lg:text-base xl:text-lg font-bold text-gray-700 leading-normal">
                  {result.detailedExplanation}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2) Arrangement Sequence (배열 순서) & Repeating Unit (반복마디) */}
        <div className="shrink-0 bg-sky-50/90 rounded-2xl p-2.5 sm:p-3.5 lg:p-4 border border-sky-200 space-y-1.5 lg:space-y-2">
          {/* Header Row: Title & Repeating Unit Badge */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-sky-600 shrink-0" />
              <span className="text-xs sm:text-sm lg:text-base font-black text-sky-900 font-kid">사진 속 배열 순서:</span>
            </div>

            {/* Repeating Unit (반복마디) Highlight */}
            {result.patternUnit && result.patternUnit.length > 0 && (
              <div className="flex items-center gap-1 bg-white/90 px-2 lg:px-3 py-0.5 lg:py-1 rounded-lg border border-emerald-300 shadow-xs">
                <span className="text-xs lg:text-sm">🔁</span>
                <span className="text-[11px] sm:text-xs lg:text-sm font-black text-emerald-900 font-kid shrink-0">반복마디:</span>
                <span className="text-[11px] sm:text-xs lg:text-sm font-extrabold text-emerald-800">
                  [{result.patternUnit.join(' - ')}]
                </span>
              </div>
            )}
          </div>

          {/* Sequence Row: Compact Chips with Arrows */}
          {result.sequenceItems && result.sequenceItems.length > 0 && (
            <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto py-1 px-0.5 scrollbar-thin">
              {result.sequenceItems.map((item, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center min-w-[50px] sm:min-w-[62px] lg:min-w-[76px] xl:min-w-[88px] bg-white p-1.5 lg:p-2.5 xl:p-3 rounded-xl shadow-2xs border border-sky-200 shrink-0">
                    <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl leading-none mb-0.5 lg:mb-1">{item.symbol || '🔹'}</span>
                    <span className="text-[10px] sm:text-[11px] lg:text-xs xl:text-sm font-bold text-gray-700 text-center truncate max-w-[54px] lg:max-w-[70px] xl:max-w-[82px]">
                      {item.name}
                    </span>
                  </div>
                  {idx < result.sequenceItems.length - 1 && (
                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 text-sky-400 shrink-0" />
                  )}
                </React.Fragment>
              ))}

              {/* Next item question mark */}
              {result.nextItem && (
                <>
                  <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 text-sky-400 shrink-0" />
                  <div className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[62px] lg:min-w-[76px] xl:min-w-[88px] bg-amber-100 p-1.5 lg:p-2.5 xl:p-3 rounded-xl border-2 border-dashed border-amber-400 shrink-0">
                    <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-amber-800 leading-none">?</span>
                    <span className="text-[10px] sm:text-[11px] lg:text-xs xl:text-sm font-bold text-amber-700 mt-0.5">다음에 올 것</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 3) Horizontal Quiz: "다음에 올 것은 무엇일까요?" with Fixed Height & Inline Praise */}
        {result.quizOptions && result.quizOptions.length > 0 && (
          <div className="shrink-0 bg-purple-50/90 rounded-2xl p-2.5 sm:p-3.5 lg:p-4 xl:p-5 border-2 border-purple-200 space-y-1.5 lg:space-y-2">
            {/* Quiz Header with Inline Feedback/Praise */}
            <div className="flex items-center justify-between gap-1.5 min-h-[22px] lg:min-h-[28px]">
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 shrink-0" />
                <h3 className="text-xs sm:text-sm lg:text-base xl:text-lg font-black text-purple-950 font-kid">
                  다음에 올 것은 무엇일까요?
                </h3>
              </div>

              {/* Short inline praise/feedback so screen does NOT expand downwards */}
              {quizAnswered && (
                <div className="animate-fade-in flex items-center gap-1 shrink-0">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-0.5 lg:py-1 bg-emerald-500 text-white text-[11px] sm:text-xs lg:text-sm font-black rounded-full shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      <span>딩동댕! 정답이에요! 참 잘했어요 🎉</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 lg:px-3 py-0.5 lg:py-1 bg-rose-500 text-white text-[11px] sm:text-xs lg:text-sm font-black rounded-full shadow-xs">
                      <Lightbulb className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      <span>정답은 '{result.nextItem}' 이에요!</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 3 Horizontal Quiz Option Buttons */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 lg:gap-3">
              {result.quizOptions.map((option, idx) => {
                const isSelected = selectedQuizIdx === idx;
                const isThisCorrect = idx === result.quizCorrectIndex;
                let btnStyle = 'bg-white hover:bg-purple-100 text-purple-950 border border-purple-200';

                if (quizAnswered) {
                  if (isThisCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-2 border-emerald-600 shadow-xs ring-2 ring-emerald-300 font-black';
                  } else if (isSelected && !isThisCorrect) {
                    btnStyle = 'bg-rose-400 text-white border-2 border-rose-500 font-bold';
                  } else {
                    btnStyle = 'bg-gray-100 text-gray-400 border border-gray-200 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizAnswered}
                    onClick={() => handleQuizSelect(idx)}
                    className={`py-2 sm:py-2.5 lg:py-3.5 xl:py-4 px-1 sm:px-2 rounded-xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-black transition-all shadow-2xs active:scale-95 cursor-pointer text-center truncate ${btnStyle}`}
                    title={option}
                  >
                    {isThisCorrect && quizAnswered && '✓ '}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. When pattern cannot be found with certainty (Retake guidance)
  return (
    <div className="w-full h-full min-h-0 bg-white rounded-3xl p-3.5 sm:p-5 lg:p-6 xl:p-7 shadow-md border-3 border-amber-400 flex flex-col justify-between gap-2.5 sm:gap-3.5 lg:gap-4 overflow-y-auto lg:overflow-visible">
      {/* Top Header Badge */}
      <div className="shrink-0 flex items-center justify-between gap-2 pb-2 lg:pb-3 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-wiggle">🧐</span>
          <div>
            <span className="inline-block px-2 py-0.5 bg-amber-200 text-amber-900 text-xs font-black rounded-full">
              규칙 알림
            </span>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-amber-950 font-kid leading-tight">
              규칙을 찾기 어려워요!
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={toggleSpeak}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs sm:text-sm shadow-xs transition cursor-pointer ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
            title="안내 소리 듣기"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-700" />}
            <span>{isSpeaking ? '멈추기' : '소리로 듣기'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-1 sm:px-2 sm:py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-full transition cursor-pointer flex items-center gap-1"
            title="다시 찍기"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">다시 찍기</span>
          </button>
        </div>
      </div>

      {/* Notice Speech Bubble */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 sm:p-4 lg:p-5 flex-1 min-h-0 flex flex-col justify-center space-y-1">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl lg:text-3xl select-none shrink-0">👀</span>
          <div className="space-y-1 flex-1">
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-gray-900 leading-snug font-kid">
              "{result.shortExplanation || '사진 속에서 반복되는 규칙을 확실하게 찾기 어려워요.'}"
            </p>
            {result.detailedExplanation && (
              <p className="text-xs sm:text-sm lg:text-base font-bold text-gray-700 leading-normal">
                {result.detailedExplanation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Illustrated Retake Tips (Compact 3-column row) */}
      <div className="shrink-0 bg-sky-50 border border-sky-200 rounded-2xl p-2.5 sm:p-3 lg:p-4 space-y-1.5 lg:space-y-2">
        <div className="flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-sky-600 shrink-0" />
          <h3 className="text-xs sm:text-sm lg:text-base font-black text-sky-950 font-kid">
            이렇게 사진을 다시 찍어볼까요?
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <div className="bg-white p-2 lg:p-3 rounded-xl border border-sky-100 shadow-2xs text-center">
            <span className="text-xl lg:text-2xl">📏</span>
            <p className="font-black text-xs lg:text-sm text-sky-900 font-kid">1. 한 줄로 나란히</p>
            <p className="text-[10px] lg:text-xs text-gray-500 hidden sm:block">왼쪽→오른쪽으로</p>
          </div>

          <div className="bg-white p-2 lg:p-3 rounded-xl border border-sky-100 shadow-2xs text-center">
            <span className="text-xl lg:text-2xl">🔁</span>
            <p className="font-black text-xs lg:text-sm text-emerald-900 font-kid">2. 2번 이상 반복</p>
            <p className="text-[10px] lg:text-xs text-gray-500 hidden sm:block">되풀이되게 놓기</p>
          </div>

          <div className="bg-white p-2 lg:p-3 rounded-xl border border-sky-100 shadow-2xs text-center">
            <span className="text-xl lg:text-2xl">💡</span>
            <p className="font-black text-xs lg:text-sm text-amber-900 font-kid">3. 밝은 곳 찰칵</p>
            <p className="text-[10px] lg:text-xs text-gray-500 hidden sm:block">흔들리지 않게</p>
          </div>
        </div>

        {result.adviceForRetake && (
          <p className="text-center font-black text-sky-900 text-xs lg:text-sm font-kid pt-0.5">
            👉 {result.adviceForRetake}
          </p>
        )}
      </div>

      {/* Big Retake Button */}
      <div className="shrink-0 pt-0.5 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-base sm:text-lg lg:text-xl rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>다시 사진 찍어보기!</span>
        </button>
      </div>
    </div>
  );
};
