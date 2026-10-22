import React from 'react';
import { samplePatterns, SamplePattern } from '../utils/sampleImages';
import { Sparkles } from 'lucide-react';

interface SamplePickerProps {
  onSelectSample: (pattern: SamplePattern, dataUrl: string) => void;
  selectedId?: string | null;
}

// 2-line clean labels for 1st grade students:
// First line 2 characters, second line 2 characters (e.g. '쌓기' / '나무')
// Never cut off with (...), never breaks into single vertical syllables.
interface TwoLineLabel {
  line1: string;
  line2: string;
}

const sampleLabels: Record<string, TwoLineLabel> = {
  'blocks-red-blue': { line1: '쌓기', line2: '나무' },
  'shapes-circle-triangle': { line1: '도형', line2: '카드' },
  'fruits-apple-banana': { line1: '과일', line2: '접시' },
  'bears-big-small': { line1: '곰', line2: '인형' },
  'messy-no-pattern': { line1: '규칙', line2: '없음' },
};

export const SamplePicker: React.FC<SamplePickerProps> = ({ onSelectSample, selectedId }) => {
  return (
    <div className="w-full bg-amber-100/70 rounded-2xl p-2.5 sm:p-3.5 lg:p-4 border border-amber-300 shadow-xs">
      {/* Title Row ('연습사진' only, without '원클릭 선택') */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm lg:text-base font-black text-amber-950 font-kid mb-1">
        <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 shrink-0" />
        <span className="whitespace-nowrap">연습사진</span>
      </div>

      {/* Guide text under 연습사진 (Protected against single-letter vertical wrapping) */}
      <p className="text-[11px] sm:text-xs lg:text-sm font-bold text-amber-900/80 mb-2 leading-tight break-keep whitespace-normal">
        사진이 없을 때 아래 연습사진을 눌러서 바로 시험해 보세요!
      </p>

      {/* 5 Quick Sample Buttons with clean 2-line labels */}
      <div className="grid grid-cols-5 gap-1 sm:gap-1.5 lg:gap-2.5">
        {samplePatterns.map((sample) => {
          const isSelected = selectedId === sample.id;
          const label = sampleLabels[sample.id] || {
            line1: sample.title.slice(0, 2),
            line2: sample.title.slice(2, 4),
          };

          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                const dataUrl = sample.generateDataUrl();
                onSelectSample(sample, dataUrl);
              }}
              className={`py-1.5 sm:py-2 lg:py-2.5 xl:py-3.5 px-0.5 sm:px-1 lg:px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center cursor-pointer shadow-xs active:scale-95 min-w-0 ${
                isSelected
                  ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500 font-black shadow-sm scale-102'
                  : 'bg-white hover:bg-amber-50 text-gray-800 border border-amber-200'
              }`}
              title={`${sample.title} (${sample.category})`}
            >
              <span className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl leading-none mb-1 shrink-0 select-none">
                {sample.emoji}
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-black font-kid leading-tight flex flex-col items-center text-center">
                <span className="whitespace-nowrap">{label.line1}</span>
                <span className="whitespace-nowrap">{label.line2}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
