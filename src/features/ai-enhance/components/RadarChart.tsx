import type { ScoreBreakdown } from '../api/aiEnhanceClient.types'

interface RadarChartProps {
  breakdown: ScoreBreakdown
}

const AXES = [
  { key: 'clarity' as const, label: 'Clarity', angle: -90 },
  { key: 'specificity' as const, label: 'Specificity', angle: 0 },
  { key: 'context' as const, label: 'Context', angle: 90 },
  { key: 'format' as const, label: 'Format', angle: 180 },
]

const SVG_SIZE = 220
const CENTER = SVG_SIZE / 2
const MAX_RADIUS = 80
const SCALE = 10

function polarToCartesian(angle: number, radius: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function getPolygonPoints(breakdown: ScoreBreakdown): string {
  return AXES.map(({ key, angle }) => {
    const value = breakdown[key]
    const radius = (value / SCALE) * MAX_RADIUS
    const { x, y } = polarToCartesian(angle, radius)
    return `${x},${y}`
  }).join(' ')
}

export function RadarChart({ breakdown }: RadarChartProps) {
  const polygonPoints = getPolygonPoints(breakdown)

  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="h-auto w-full max-w-[220px]"
      role="img"
      aria-label="Score radar chart"
    >
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((fraction) => (
        <polygon
          key={fraction}
          points={AXES.map(({ angle }) => {
            const { x, y } = polarToCartesian(angle, MAX_RADIUS * fraction)
            return `${x},${y}`
          }).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-[#E2E5DC] dark:text-[#2C3130]"
        />
      ))}

      {/* Axis lines */}
      {AXES.map(({ key, angle }) => {
        const { x, y } = polarToCartesian(angle, MAX_RADIUS)
        return (
          <line
            key={key}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[#E2E5DC] dark:text-[#2C3130]"
          />
        )
      })}

      {/* Score polygon */}
      <polygon
        points={polygonPoints}
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-[#3652E0] dark:text-[#8493FF]"
      />

      {/* Score dots */}
      {AXES.map(({ key, angle }) => {
        const value = breakdown[key]
        const radius = (value / SCALE) * MAX_RADIUS
        const { x, y } = polarToCartesian(angle, radius)
        return (
          <circle
            key={key}
            cx={x}
            cy={y}
            r="3"
            fill="currentColor"
            className="text-[#3652E0] dark:text-[#8493FF]"
          />
        )
      })}

      {/* Axis labels */}
      {AXES.map(({ key, label, angle }) => {
        const { x, y } = polarToCartesian(angle, MAX_RADIUS + 18)
        return (
          <text
            key={key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#5B5F58] text-[10px] font-medium dark:fill-[#A2A79C]"
          >
            {label}
          </text>
        )
      })}

      {/* Score values on axes */}
      {AXES.map(({ key, angle }) => {
        const value = breakdown[key]
        const radius = (value / SCALE) * MAX_RADIUS
        const { x, y } = polarToCartesian(angle, radius)
        return (
          <text
            key={`val-${key}`}
            x={x}
            y={y - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#3652E0] text-[9px] font-semibold dark:fill-[#8493FF]"
          >
            {value}
          </text>
        )
      })}
    </svg>
  )
}
