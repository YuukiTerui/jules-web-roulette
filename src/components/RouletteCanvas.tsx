import React, { useRef, useEffect, useState } from 'react';
import { RouletteItem } from '../types';

interface RouletteCanvasProps {
  items: RouletteItem[];
  width: number;
  height: number;
  isSpinning: boolean;
  targetRotation: number;
  winner: RouletteItem | null;
  onSpinEnd: () => void;
}

const COLORS = ["#FFC107", "#FF9800", "#FF5722", "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B"];

const RouletteCanvas: React.FC<RouletteCanvasProps> = ({ items, width, height, isSpinning, targetRotation, winner, onSpinEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const onSpinEndRef = useRef(onSpinEnd);

  useEffect(() => {
    onSpinEndRef.current = onSpinEnd;
  }, [onSpinEnd]);

  const drawRoulette = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numItems = items.length;
    const arcSize = (2 * Math.PI) / numItems;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-centerX, -centerY);

    ctx.font = '16px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    items.forEach((item, i) => {
      const angle = i * arcSize;
      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = 'black';
      const textAngle = angle + arcSize / 2;
      ctx.translate(centerX + Math.cos(textAngle) * radius * 0.6, centerY + Math.sin(textAngle) * radius * 0.6);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillText(item.name, 0, 0);
      ctx.restore();
    });
    ctx.restore();

    // Draw pointer
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, 10);
    ctx.lineTo(centerX + 10, 10);
    ctx.lineTo(centerX, 30);
    ctx.closePath();
    ctx.fill();
  };

  useEffect(() => {
    if (isSpinning) {
      const startTime = Date.now();
      const duration = 5000; // 5 seconds spin
      const startRotation = currentRotation;

      const animate = () => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5);
        const easedProgress = easeOutQuint(progress);

        const newRotation = startRotation + (targetRotation - startRotation) * easedProgress;

        if (progress < 1) {
          setCurrentRotation(newRotation);
          animationFrameId.current = requestAnimationFrame(animate);
        } else {
          setCurrentRotation(targetRotation);
          if (winner) {
            onSpinEndRef.current(winner);
          }
        }
      };

      setCurrentRotation(currentRotation % 360);
      animationFrameId.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, targetRotation, winner]);

  useEffect(() => {
      if (items.length === 0) {
          setCurrentRotation(0);
      }
      drawRoulette(currentRotation);
  }, [currentRotation, items, width, height]);


  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default RouletteCanvas;
