'use client';

import React, { useState, useId } from 'react';
import { PerformanceDataPoint } from '@/types/typing';

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  averageWpm: number;
  duration: number;
}

export function PerformanceChart({ data, averageWpm, duration }: PerformanceChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = useId();

  const chartData =
    data.length >= 2
      ? data
      : [
          { second: 0, wpm: 0, rawWpm: 0, accuracy: 100, errors: 0 },
          { second: Math.max(1, duration), wpm: averageWpm, rawWpm: averageWpm, accuracy: 100, errors: 0 },
        ];

  // Dynamic maximum scale with headroom
  const dataMaxWpm = Math.max(...chartData.map((d) => d.wpm));
  const maxWpm = Math.max(40, Math.ceil((Math.max(dataMaxWpm, averageWpm) + 12) / 10) * 10);

  // SVG dimensions
  const width = 680;
  const height = 190;
  const paddingLeft = 38;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 32;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const getX = (second: number) => {
    const maxSec = Math.max(1, chartData[chartData.length - 1].second);
    return paddingLeft + (second / maxSec) * innerWidth;
  };

  const getY = (wpm: number) => {
    return paddingTop + innerHeight - (Math.max(0, wpm) / maxWpm) * innerHeight;
  };

  const points = chartData.map((d) => ({
    x: getX(d.second),
    y: getY(d.wpm),
  }));

  // Build smooth cubic bezier curve through points
  const buildSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      // Control points for smooth spline
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const smoothPathD = buildSmoothPath(points);

  // Area under curve
  const areaD =
    points.length > 0
      ? `${smoothPathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${
          paddingTop + innerHeight
        } Z`
      : '';

  const avgY = getY(averageWpm);
  const yTicks = [0, Math.round(maxWpm * 0.5), maxWpm];
  const hoveredPoint = hoverIndex !== null ? chartData[hoverIndex] : null;

  // Find peak point
  const peakWpm = Math.max(...chartData.map((d) => d.wpm));

  return (
    <div
      className="w-full rounded-md border p-4 transition-colors select-none"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--bg-border)',
      }}
    >
      <div className="flex items-center justify-between mb-3 text-xs font-semibold text-[var(--text-main)]">
        <div className="flex items-center gap-2">
          <span>Grafik Kecepatan Sesi (Fluktuasi WPM Naik-Turun)</span>
          <span className="text-[10px] text-[var(--text-muted)] font-normal">
            (Puncak: {peakWpm} WPM)
          </span>
        </div>
        <span className="font-mono text-[var(--text-muted)] font-normal text-[11px]">
          Rata-rata: {averageWpm} WPM
        </span>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={`chart-grad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-chart)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={`tick-${i}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--bg-border)"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                  opacity="0.8"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="var(--text-muted)"
                  fontFamily="sans-serif"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Average WPM reference dashed line */}
          <line
            x1={paddingLeft}
            y1={avgY}
            x2={width - paddingRight}
            y2={avgY}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            strokeWidth="1.2"
            opacity="0.85"
          />
          <text
            x={width - paddingRight - 4}
            y={avgY - 4}
            textAnchor="end"
            fontSize="9"
            fill="var(--text-muted)"
            fontFamily="sans-serif"
          >
            Rata-rata: {averageWpm} WPM
          </text>

          {/* Area fill */}
          <path d={areaD} fill={`url(#chart-grad-${chartId})`} />

          {/* Smooth fluctuating line stroke */}
          <path
            d={smoothPathD}
            fill="none"
            stroke="var(--color-chart)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive data points */}
          {points.map((p, idx) => (
            <g
              key={`p-${idx}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
            >
              <circle cx={p.x} cy={p.y} r="8" fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === idx ? 4.5 : 2}
                fill={hoverIndex === idx ? 'var(--bg-surface)' : 'var(--color-chart)'}
                stroke="var(--color-chart)"
                strokeWidth={hoverIndex === idx ? 2 : 1}
              />
            </g>
          ))}

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + innerHeight}
            x2={width - paddingRight}
            y2={paddingTop + innerHeight}
            stroke="var(--bg-border)"
            strokeWidth="1"
          />

          {/* Time axis labels */}
          <text
            x={paddingLeft}
            y={height - 8}
            textAnchor="start"
            fontSize="9"
            fill="var(--text-muted)"
          >
            0s
          </text>
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="9"
            fill="var(--text-muted)"
          >
            Waktu (detik)
          </text>
          <text
            x={width - paddingRight}
            y={height - 8}
            textAnchor="end"
            fontSize="9"
            fill="var(--text-muted)"
          >
            {chartData[chartData.length - 1].second}s
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && hoverIndex !== null && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full rounded border px-2.5 py-1.5 shadow-md text-xs font-sans transition-all"
            style={{
              left: `${(points[hoverIndex].x / width) * 100}%`,
              top: `${Math.max(4, (points[hoverIndex].y / height) * 100 - 8)}%`,
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--bg-border)',
              color: 'var(--text-main)',
            }}
          >
            <div className="font-bold text-[var(--color-accent)]">
              {hoveredPoint.wpm} WPM
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Detik ke-{hoveredPoint.second} · {hoveredPoint.accuracy}% akurasi
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
