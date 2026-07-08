'use client';

import { motion } from 'framer-motion';
import { TrustScore } from '@/lib/types';

interface TrustScoreCardProps {
  score: TrustScore;
  verdict: 'AUTHENTIC' | 'MODIFIED' | 'INCONCLUSIVE' | 'DEGRADED';
}

export function TrustScoreCard({ score, verdict }: TrustScoreCardProps) {
  const getScoreColor = (verdict: string, score: number) => {
    switch (verdict) {
      case 'AUTHENTIC':
        return 'from-green-500 to-emerald-600';
      case 'MODIFIED':
        return 'from-red-500 to-rose-600';
      case 'INCONCLUSIVE':
        return 'from-amber-500 to-orange-600';
      case 'DEGRADED':
        return 'from-slate-500 to-gray-600';
      default:
        return 'from-blue-500 to-cyan-600';
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Highly Confident';
    if (score >= 75) return 'Confident';
    if (score >= 60) return 'Moderate';
    if (score >= 40) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular Progress */}
      <div className="relative h-40 w-40">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className={`origin-center stroke-amber-500 transition-all duration-300 -rotate-90 ${
              verdict === 'AUTHENTIC'
                ? 'stroke-green-500'
                : verdict === 'MODIFIED'
                  ? 'stroke-red-500'
                  : verdict === 'INCONCLUSIVE'
                    ? 'stroke-orange-500'
                    : 'stroke-slate-500'
            }`}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="text-center"
          >
            <div className="text-4xl font-bold text-foreground">{score}</div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Verification Score
            </div>
          </motion.div>
        </div>
      </div>

      {/* Verdict Label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="flex flex-col items-center gap-2"
      >
        <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
          verdict === 'AUTHENTIC'
            ? 'bg-green-500/20 text-green-300'
            : verdict === 'MODIFIED'
              ? 'bg-red-500/20 text-red-300'
              : verdict === 'INCONCLUSIVE'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-slate-500/20 text-slate-300'
        }`}>
          {verdict}
        </div>
        <div className="text-sm text-muted-foreground">{getScoreLabel(score)}</div>
      </motion.div>
    </div>
  );
}
