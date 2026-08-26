"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
  initialZoom?: number;
  showControls?: boolean;
  externalZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export function ZoomableImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  maxZoom = 4,
  minZoom = 1,
  zoomStep = 0.25,
  initialZoom = 1,
  showControls = false,
  externalZoom,
  onZoomChange,
}: ZoomableImageProps) {
  const [scale, setScale] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Touch pinch tracking
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialPinchScaleRef = useRef<number>(1);
  const lastTouchPosRef = useRef<{ x: number; y: number } | null>(null);

  // Sync with externalZoom if provided
  useEffect(() => {
    if (externalZoom !== undefined && externalZoom !== scale) {
      setScale(externalZoom);
      if (externalZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
    }
  }, [externalZoom]);

  const updateScale = useCallback(
    (newScale: number) => {
      const clampedScale = Math.min(Math.max(newScale, minZoom), maxZoom);
      setScale(clampedScale);
      if (onZoomChange) {
        onZoomChange(clampedScale);
      }
      if (clampedScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    },
    [minZoom, maxZoom, onZoomChange]
  );

  const handleZoomIn = () => updateScale(scale + zoomStep);
  const handleZoomOut = () => updateScale(scale - zoomStep);
  const handleReset = () => {
    updateScale(initialZoom);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Drag Handlers (only active when zoomed in)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1 || e.button !== 0) return; // Only drag when zoomed in
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Pinch-to-Zoom & Drag
  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // 2 fingers: pinch start
      initialPinchDistanceRef.current = getTouchDistance(e.touches);
      initialPinchScaleRef.current = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      // 1 finger: pan when zoomed in
      lastTouchPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
      // Pinching with 2 fingers
      const currentDistance = getTouchDistance(e.touches);
      const factor = currentDistance / initialPinchDistanceRef.current;
      const newScale = initialPinchScaleRef.current * factor;
      updateScale(newScale);
    } else if (e.touches.length === 1 && lastTouchPosRef.current !== null && scale > 1) {
      // Pan when zoomed in
      const dx = e.touches[0].clientX - lastTouchPosRef.current.x;
      const dy = e.touches[0].clientY - lastTouchPosRef.current.y;
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      lastTouchPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      initialPinchDistanceRef.current = null;
    }
    if (e.touches.length === 0) {
      lastTouchPosRef.current = null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex items-center justify-center select-none w-full h-full ${containerClassName}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        touchAction: scale > 1 ? "none" : "pan-y",
      }}
    >
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: isDragging ? "none" : "transform 0.1s ease-out",
        }}
        className="flex items-center justify-center max-w-full max-h-full"
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          draggable={false}
          className={`object-contain pointer-events-none ${className}`}
        />
      </div>

      {showControls && (
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-700 p-1.5 rounded-xl shadow-lg backdrop-blur">
          <button
            onClick={handleZoomOut}
            disabled={scale <= minZoom}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Reduzir Zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs font-mono font-bold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Restaurar 100%"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            disabled={scale >= maxZoom}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {scale !== 1 && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-700 ml-1 pl-2"
              title="Centralizar / Resetar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
