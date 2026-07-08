'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { Recommendation } from '@/lib/types';

interface RecommendationPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ACTION':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'CAUTION':
        return <AlertCircle className="h-5 w-5" />;
      case 'VERIFICATION':
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ACTION':
        return {
          container: 'bg-green-500/5 border-green-500/20',
          badge: 'bg-green-500/10 text-green-300',
          icon: 'text-green-400',
        };
      case 'CAUTION':
        return {
          container: 'bg-amber-500/5 border-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-300',
          icon: 'text-amber-400',
        };
      case 'VERIFICATION':
        return {
          container: 'bg-amber-500/5 border-amber-500/20',
          badge: 'bg-amber-500/10 text-amber-300',
          icon: 'text-amber-400',
        };
      default:
        return {
          container: 'bg-slate-500/5 border-slate-500/20',
          badge: 'bg-slate-500/10 text-slate-300',
          icon: 'text-slate-400',
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/15 text-red-300 border border-red-500/30';
      case 'MEDIUM':
        return 'bg-orange-500/15 text-orange-300 border border-orange-500/30';
      case 'LOW':
        return 'bg-green-500/15 text-green-300 border border-green-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border border-slate-500/30';
    }
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
  });

  return (
    <div className="space-y-3">
      {sortedRecommendations.map((rec, index) => {
        const colors = getTypeColor(rec.type);
        const priorityColor = getPriorityColor(rec.priority);

        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`rounded-lg border ${colors.container} p-4`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`mt-0.5 flex-shrink-0 ${colors.icon}`}>
                {getTypeIcon(rec.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{rec.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{rec.description}</p>
                  </div>

                  {/* Priority Badge */}
                  <span
                    className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${priorityColor}`}
                  >
                    {rec.priority}
                  </span>
                </div>

                {/* Type Badge */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}
                  >
                    {rec.type}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {recommendations.length === 0 && (
        <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">No recommendations at this time</p>
        </div>
      )}
    </div>
  );
}
