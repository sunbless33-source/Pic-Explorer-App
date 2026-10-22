import React, { useEffect, useState } from 'react';

const loadingTips = [
  '🔍 돋보기로 색깔이 어떻게 바뀌는지 살펴보고 있어요...',
  '✨ 모양들이 어떤 순서로 놓여 있는지 세어보고 있어요...',
  '🤔 다음에 어떤 물건이 올지 곰곰이 생각하고 있어요...',
  '🎈 수리수리 마수리! 거의 다 찾았어요!',
];

export const LoadingBanner: React.FC = () => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full min-h-0 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 rounded-3xl p-5 sm:p-6 lg:p-8 xl:p-10 shadow-md border-3 border-amber-300 text-center flex flex-col items-center justify-center gap-3.5 lg:gap-6 animate-pulse-soft">
      {/* Animated icon */}
      <div className="relative inline-block">
        <span className="text-4xl sm:text-5xl lg:text-6xl block animate-bounce-gentle">🔍</span>
        <span className="absolute -top-1 -right-2 text-2xl lg:text-3xl animate-spin">✨</span>
      </div>

      <div className="space-y-1 lg:space-y-2">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-950 font-kid">
          수리수리 마수리~ 규칙을 찾고 있어요!
        </h3>
        <p className="text-sm sm:text-base lg:text-lg font-bold text-amber-800 transition-all duration-300 min-h-[26px]">
          {loadingTips[tipIndex]}
        </p>
      </div>

      {/* Playful progress bar */}
      <div className="w-full max-w-xs lg:max-w-md mx-auto bg-white/70 h-3 lg:h-4 rounded-full overflow-hidden p-0.5 border border-amber-300">
        <div className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-full animate-[wiggle_1.2s_ease-in-out_infinite] w-full" />
      </div>

      <p className="text-xs sm:text-sm lg:text-base font-bold text-amber-700">
        AI 규칙 탐정이 사진을 살펴보는 중이에요 ⏱️
      </p>
    </div>
  );
};
