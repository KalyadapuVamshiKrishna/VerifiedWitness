'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Zap, CheckCheck, AlertCircle } from 'lucide-react';
import { AIFinding } from '@/lib/types';

interface AIFindingsProps {
  findings: AIFinding[];
}

export function AIFindings({ findings }: AIFindingsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANOMALY':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CONSISTENCY':
        return <CheckCheck className="h-4 w-4" />;
      case 'CONCERN':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANOMALY':
        return {
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          icon: 'text-amber-400',
        };
      case 'CONSISTENCY':
        return {
          badge: 'bg-green-500/10 text-green-300 border-green-500/20',
          icon: 'text-green-400',
        };
      case 'CONCERN':
        return {
          badge: 'bg-red-500/10 text-red-300 border-red-500/20',
          icon: 'text-red-400',
        };
      default:
        return {
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: 'text-amber-400',
        };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-300 border border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-300 border border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'LOW':
        return 'bg-green-500/15 text-green-300 border border-green-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border border-slate-500/30';
    }
  };

  const confidencePercent = (confidence: number) => `${Math.round(confidence * 100)}%`;

  const groupedFindings = findings.reduce(
    (acc, finding) => {
      const existing = acc.find((g) => g.type === finding.type);
      if (existing) {
        existing.items.push(finding);
      } else {
        acc.push({ type: finding.type, items: [finding] });
      }
      return acc;
    },
    [] as { type: string; items: AIFinding[] }[],
  );

  return (
    <div className="space-y-4">
      {groupedFindings.map((group, groupIndex) => {
        const colors = getTypeColor(group.type);
        return (
          <motion.div
            key={group.type}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="space-y-2"
          >
            {/* Group header */}
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${colors.badge}`}>
              <span className={colors.icon}>{getTypeIcon(group.type)}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">{group.type}</span>
              <span className="ml-1 text-xs opacity-75">({group.items.length})</span>
            </div>

            {/* Findings in group */}
            <div className="space-y-2 pl-6">
              {group.items.map((finding, itemIndex) => (
                <motion.div
                  key={finding.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.1 + itemIndex * 0.05 }}
                  className="rounded-lg border border-border bg-card/50 p-3"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{finding.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{finding.description}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded px-2 py-1 text-xs font-medium ${getSeverityColor(finding.severity)}`}
                    >
                      {finding.severity}
                    </span>
                  </div>

                  {/* Category, Confidence, Evidence */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <span className="rounded bg-muted px-2 py-1 text-muted-foreground">
                      {finding.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-semibold text-foreground">
                        {confidencePercent(finding.confidence)}
                      </span>
                    </div>
                    {finding.evidence.length > 0 && (
                      <span className="rounded bg-muted px-2 py-1 text-muted-foreground">
                        {finding.evidence.length} piece{finding.evidence.length !== 1 ? 's' : ''} of evidence
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {findings.length === 0 && (
        <div className="rounded-lg border border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">No AI findings available</p>
        </div>
      )}
    </div>
  );
}
