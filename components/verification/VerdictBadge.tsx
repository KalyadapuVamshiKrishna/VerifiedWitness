'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from 'lucide-react';
import { VerificationVerdict } from '@/lib/types';

interface VerdictBadgeProps {
  verdict: VerificationVerdict;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerdictBadge({ verdict, size = 'md', showLabel = true }: VerdictBadgeProps) {
  const getConfig = (v: VerificationVerdict) => {
    switch (v) {
      case 'AUTHENTIC':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          label: 'Authentic',
        };
      case 'MODIFIED':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          label: 'Modified',
        };
      case 'INCONCLUSIVE':
        return {
          icon: HelpCircle,
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          label: 'Inconclusive',
        };
      case 'DEGRADED':
        return {
          icon: AlertCircle,
          color: 'text-slate-500',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          label: 'Degraded',
        };
    }
  };

  const config = getConfig(verdict);
  const Icon = config.icon;

  const sizes = {
    sm: { container: 'gap-1.5 px-2 py-1', icon: 'w-3 h-3', text: 'text-xs' },
    md: { container: 'gap-2 px-3 py-2', icon: 'w-4 h-4', text: 'text-sm' },
    lg: { container: 'gap-2.5 px-4 py-3', icon: 'w-5 h-5', text: 'text-base' },
  };

  const sizeConfig = sizes[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center ${sizeConfig.container} rounded-full border ${config.bg} ${config.border}`}
    >
      <Icon className={`${sizeConfig.icon} ${config.color}`} />
      {showLabel && <span className={`font-medium ${config.color} ${sizeConfig.text}`}>{config.label}</span>}
    </motion.div>
  );
}
