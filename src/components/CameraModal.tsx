import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setErrorMsg('카메라를 켤 수 없어요. 아래 "사진 파일 고르기" 버튼으로 사진을 올려보세요!');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    onCapture(dataUrl);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-100 border-b-2 border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <h2 className="text-xl md:text-2xl font-black text-amber-900 font-kid">
              사진 찍기 (카메라)
            </h2>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition shadow"
            title="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative bg-slate-900 aspect-video flex items-center justify-center overflow-hidden">
          {errorMsg ? (
            <div className="p-6 text-center text-white">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-lg font-bold mb-4">{errorMsg}</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-2xl text-lg shadow-lg"
              >
                확인
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Guideline */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 border-2 border-dashed border-amber-300/80 rounded-2xl h-28 pointer-events-none flex items-center justify-center bg-amber-400/10 backdrop-blur-[1px]">
                <span className="text-amber-200 font-bold text-sm md:text-base drop-shadow-md px-3 py-1 bg-black/40 rounded-full">
                  👉 여기에 규칙 물건들을 한 줄로 놓아보세요!
                </span>
              </div>

              {/* Flip camera button */}
              <button
                type="button"
                onClick={toggleFacingMode}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition"
                title="카메라 방향 바꾸기"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Camera Control Footer */}
        {!errorMsg && (
          <div className="p-5 bg-amber-50 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={handleCapture}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950 font-black text-2xl rounded-full shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer border-4 border-white"
            >
              <Camera className="w-8 h-8" />
              찰칵! 찍기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
