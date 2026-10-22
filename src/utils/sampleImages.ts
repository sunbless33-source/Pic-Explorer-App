/**
 * Generates sample classroom math pattern photos as JPEG data URLs using HTML5 Canvas.
 * This allows instant hands-on testing in preview without requiring an external camera.
 */

export interface SamplePattern {
  id: string;
  title: string;
  category: string;
  description: string;
  emoji: string;
  expectedPattern: boolean;
  generateDataUrl: () => string;
}

export const samplePatterns: SamplePattern[] = [
  {
    id: 'blocks-red-blue',
    title: '빨강-파랑 쌓기나무',
    category: '색깔 규칙',
    description: '빨간 블록과 파란 블록이 하나씩 번갈아 놓여 있어요',
    emoji: '🧱',
    expectedPattern: true,
    generateDataUrl: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Classroom desk background (light wood texture)
      const grad = ctx.createLinearGradient(0, 0, 900, 500);
      grad.addColorStop(0, '#F5DEB3');
      grad.addColorStop(1, '#E6C280');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 900, 500);

      // Wood grain lines
      ctx.strokeStyle = 'rgba(180, 140, 80, 0.15)';
      ctx.lineWidth = 3;
      for (let y = 30; y < 500; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(300, y + 10, 600, y - 10, 900, y + 5);
        ctx.stroke();
      }

      // Desk guideline
      ctx.strokeStyle = 'rgba(150, 110, 60, 0.3)';
      ctx.setLineDash([12, 12]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 290);
      ctx.lineTo(850, 290);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw repeating blocks: Red, Blue, Red, Blue, Red, Blue
      const colors = ['#EF4444', '#3B82F6', '#EF4444', '#3B82F6', '#EF4444', '#3B82F6'];
      const startX = 100;
      const blockWidth = 95;
      const blockHeight = 95;
      const gap = 30;

      colors.forEach((color, i) => {
        const x = startX + i * (blockWidth + gap);
        const y = 200;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + blockWidth / 2, y + blockHeight + 8, blockWidth / 2 + 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D block top
        ctx.fillStyle = color === '#EF4444' ? '#F87171' : '#60A5FA';
        ctx.beginPath();
        ctx.moveTo(x + 15, y - 15);
        ctx.lineTo(x + blockWidth + 15, y - 15);
        ctx.lineTo(x + blockWidth, y);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();

        // 3D block right side
        ctx.fillStyle = color === '#EF4444' ? '#B91C1C' : '#1D4ED8';
        ctx.beginPath();
        ctx.moveTo(x + blockWidth, y);
        ctx.lineTo(x + blockWidth + 15, y - 15);
        ctx.lineTo(x + blockWidth + 15, y + blockHeight - 15);
        ctx.lineTo(x + blockWidth, y + blockHeight);
        ctx.closePath();
        ctx.fill();

        // Block main face
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockWidth, blockHeight);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, blockWidth, blockHeight);

        // Circular knob on top (like Lego/snap cube)
        ctx.fillStyle = color === '#EF4444' ? '#DC2626' : '#2563EB';
        ctx.beginPath();
        ctx.ellipse(x + blockWidth / 2 + 7, y - 12, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Label at bottom
      ctx.fillStyle = '#6B4E26';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('수학 교구 쌓기나무: 빨강 - 파랑 - 빨강 - 파랑 - 빨강 - 파랑', 450, 440);

      return canvas.toDataURL('image/jpeg', 0.80);
    },
  },
  {
    id: 'shapes-circle-triangle',
    title: '동그라미-세모 모양 카드',
    category: '모양 규칙',
    description: '노란 동그라미와 초록 세모가 차례대로 나와요',
    emoji: '🟡',
    expectedPattern: true,
    generateDataUrl: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Soft blue checkered paper mat
      ctx.fillStyle = '#F0F9FF';
      ctx.fillRect(0, 0, 900, 500);

      // Grid pattern
      ctx.strokeStyle = '#E0F2FE';
      ctx.lineWidth = 1;
      for (let x = 0; x < 900; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 500);
        ctx.stroke();
      }
      for (let y = 0; y < 500; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(900, y);
        ctx.stroke();
      }

      // Shapes repeating: Circle, Triangle, Circle, Triangle, Circle, Triangle
      const shapes = ['circle', 'triangle', 'circle', 'triangle', 'circle', 'triangle'];
      const startX = 110;
      const step = 135;
      const centerY = 240;

      shapes.forEach((shape, i) => {
        const cx = startX + i * step;

        // Drop shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath();
        ctx.ellipse(cx, centerY + 65, 45, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        if (shape === 'circle') {
          // Yellow Circle card
          ctx.fillStyle = '#FBBF24';
          ctx.beginPath();
          ctx.arc(cx, centerY, 50, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Cute smile
          ctx.fillStyle = '#78350F';
          ctx.beginPath();
          ctx.arc(cx - 15, centerY - 8, 4, 0, Math.PI * 2);
          ctx.arc(cx + 15, centerY - 8, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, centerY + 8, 14, 0, Math.PI);
          ctx.stroke();
        } else {
          // Green Triangle card
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.moveTo(cx, centerY - 52);
          ctx.lineTo(cx - 52, centerY + 48);
          ctx.lineTo(cx + 52, centerY + 48);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Cute smile
          ctx.fillStyle = '#064E3B';
          ctx.beginPath();
          ctx.arc(cx - 14, centerY + 6, 4, 0, Math.PI * 2);
          ctx.arc(cx + 14, centerY + 6, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#064E3B';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, centerY + 18, 12, 0, Math.PI);
          ctx.stroke();
        }
      });

      // Label at bottom
      ctx.fillStyle = '#0369A1';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('도형 모양 카드: 동그라미 - 세모 - 동그라미 - 세모 - 동그라미 - 세모', 450, 440);

      return canvas.toDataURL('image/jpeg', 0.80);
    },
  },
  {
    id: 'fruits-apple-banana',
    title: '사과-바나나 과일 접시',
    category: '순서 규칙',
    description: '빨간 사과와 노란 바나나가 순서대로 놓여 있어요',
    emoji: '🍎',
    expectedPattern: true,
    generateDataUrl: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Pastel mint background
      ctx.fillStyle = '#ECFDF5';
      ctx.fillRect(0, 0, 900, 500);

      // Long wooden serving tray
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.roundRect(50, 160, 800, 180, 24);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      ctx.stroke();

      const sequence = ['apple', 'banana', 'apple', 'banana', 'apple', 'banana'];
      const startX = 120;
      const step = 130;

      sequence.forEach((item, i) => {
        const x = startX + i * step;
        const y = 240;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x, y + 42, 35, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        if (item === 'apple') {
          // Apple body
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(x - 14, y, 28, 0, Math.PI * 2);
          ctx.arc(x + 14, y, 28, 0, Math.PI * 2);
          ctx.fill();

          // Apple stem
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x, y - 26);
          ctx.quadraticCurveTo(x + 6, y - 45, x + 12, y - 40);
          ctx.stroke();

          // Apple leaf
          ctx.fillStyle = '#22C55E';
          ctx.beginPath();
          ctx.ellipse(x + 12, y - 36, 10, 5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Banana body
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 26;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(x, y - 10, 40, 0.4 * Math.PI, 0.95 * Math.PI, false);
          ctx.stroke();

          // Banana tips
          ctx.fillStyle = '#713F12';
          ctx.beginPath();
          ctx.arc(x - 28, y + 26, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Label at bottom
      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('맛있는 과일 순서: 사과 - 바나나 - 사과 - 바나나 - 사과 - 바나나', 450, 440);

      return canvas.toDataURL('image/jpeg', 0.80);
    },
  },
  {
    id: 'bears-big-small',
    title: '큰 곰-작은 곰 인형',
    category: '크기 규칙',
    description: '키가 큰 곰과 작은 곰이 번갈아 서 있어요',
    emoji: '🧸',
    expectedPattern: true,
    generateDataUrl: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Soft purple background
      ctx.fillStyle = '#FAF5FF';
      ctx.fillRect(0, 0, 900, 500);

      // Grass carpet
      ctx.fillStyle = '#DCFCE7';
      ctx.fillRect(0, 320, 900, 180);
      ctx.strokeStyle = '#86EFAC';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 320);
      ctx.lineTo(900, 320);
      ctx.stroke();

      const sequence = ['big', 'small', 'big', 'small', 'big', 'small'];
      const startX = 120;
      const step = 130;

      sequence.forEach((size, i) => {
        const x = startX + i * step;
        const groundY = 320;
        const scale = size === 'big' ? 1.0 : 0.65;
        const bearY = groundY - 70 * scale;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x, groundY + 5, 30 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bear ears
        ctx.fillStyle = '#92400E';
        ctx.beginPath();
        ctx.arc(x - 22 * scale, bearY - 26 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.arc(x + 22 * scale, bearY - 26 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Bear body
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.ellipse(x, bearY + 28 * scale, 32 * scale, 38 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bear head
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(x, bearY, 32 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#FDE68A';
        ctx.beginPath();
        ctx.ellipse(x, bearY + 8 * scale, 14 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = '#451A03';
        ctx.beginPath();
        ctx.arc(x, bearY + 4 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.beginPath();
        ctx.arc(x - 10 * scale, bearY - 6 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.arc(x + 10 * scale, bearY - 6 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      // Label at bottom
      ctx.fillStyle = '#581C87';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('곰돌이 인형 크기: 큰 곰 - 작은 곰 - 큰 곰 - 작은 곰 - 큰 곰 - 작은 곰', 450, 440);

      return canvas.toDataURL('image/jpeg', 0.80);
    },
  },
  {
    id: 'messy-no-pattern',
    title: '어질러진 학용품 (규칙 없음)',
    category: '규칙을 찾기 어려운 사진',
    description: '규칙 없이 흩어져 있어 다시 찍어야 하는 예시예요',
    emoji: '❓',
    expectedPattern: false,
    generateDataUrl: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      // Grey desk background
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, 0, 900, 500);

      // Messy scattered items without any pattern
      // 1. Crooked pencil
      ctx.save();
      ctx.translate(220, 180);
      ctx.rotate(0.6);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-80, -10, 160, 20);
      ctx.fillStyle = '#FBCFE8';
      ctx.fillRect(80, -10, 20, 20); // eraser
      ctx.restore();

      // 2. Crumpled paper
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.arc(520, 160, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Random single scissor
      ctx.save();
      ctx.translate(380, 310);
      ctx.rotate(-0.8);
      ctx.fillStyle = '#EC4899';
      ctx.beginPath();
      ctx.arc(-20, 0, 22, 0, Math.PI * 2);
      ctx.arc(20, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748B';
      ctx.fillRect(-10, -70, 8, 70);
      ctx.fillRect(2, -70, 8, 70);
      ctx.restore();

      // 4. Random single coin/clip
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(680, 280, 25, 0, Math.PI * 2);
      ctx.fill();

      // 5. Question mark watermark
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', 450, 280);

      // Warning text
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('어질러진 학용품: 일정한 반복 규칙이 보이지 않아요!', 450, 440);

      return canvas.toDataURL('image/jpeg', 0.80);
    },
  },
];
