'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, HelpCircle, Clock } from 'lucide-react';
import { EvidenceItem } from '@/lib/types';

interface EvidenceTimelineProps {
  items: EvidenceItem[];
}

export function EvidenceTimeline({ items }: EvidenceTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'ANOMALY':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'INCONCLUSIVE':
        return <HelpCircle className="h-5 w-5 text-slate-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-green-400';
      case 'ANOMALY':
        return 'text-orange-400';
      case 'INCONCLUSIVE':
        return 'text-slate-400';
      default:
        return 'text-amber-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'METADATA':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'OCR':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'AI_ANALYSIS':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'TIMELINE':
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border border-slate-500/30';
    }
  };

  const sortedItems = [...items].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return (
    <div className="space-y-1">
      {sortedItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative flex gap-4 pb-8 last:pb-0"
        >
          {/* Vertical line */}
          {index < sortedItems.length - 1 && (
            <div className="absolute left-2.5 top-10 h-8 w-0.5 bg-gradient-to-b from-border to-transparent" />
          )}

          {/* Timeline point */}
          <div className="relative mt-1 flex-shrink-0">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card">
              {getStatusIcon(item.status)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </div>
              <span className={`flex-shrink-0 text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>

            {/* Type badge and timestamp */}
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${getTypeColor(item.type)}`}>
                {item.type}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.timestamp.toLocaleString()}
              </span>
            </div>

            {/* Details if present */}
            {item.details && Object.keys(item.details).length > 0 && (
              <div className="mt-2 space-y-1 rounded bg-muted/50 p-2">
                {Object.entries(item.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="text-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
