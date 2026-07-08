'use client';

import { motion } from 'framer-motion';

interface MetadataHealthProps {
  integrity: number;
  consistency: number;
  completeness: number;
  anomalies?: string[];
}

export function MetadataHealth({
  integrity,
  consistency,
  completeness,
  anomalies = [],
}: MetadataHealthProps) {
  const metrics = [
    { label: 'Integrity', value: integrity, description: 'Data was not altered' },
    { label: 'Consistency', value: consistency, description: 'Fields are logically aligned' },
    { label: 'Completeness', value: completeness, description: 'All expected fields present' },
  ];

  const averageHealth = Math.round((integrity + consistency + completeness) / 3);

  const getHealthColor = (value: number) => {
    if (value >= 90) return 'from-green-500 to-emerald-600';
    if (value >= 75) return 'from-amber-500 to-amber-600';
    if (value >= 60) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getHealthTextColor = (value: number) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 75) return 'text-amber-400';
    if (value >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Metadata Health</h3>
          <span className={`text-2xl font-bold ${getHealthTextColor(averageHealth)}`}>
            {averageHealth}%
          </span>
        </div>

        {/* Health Bar */}
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${averageHealth}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full bg-gradient-to-r ${getHealthColor(averageHealth)}`}
          />
        </div>

        {/* Metric Breakdown */}
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                  <span className="text-xs text-muted-foreground">{metric.description}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 + index * 0.1 }}
                    className={`h-full bg-gradient-to-r ${getHealthColor(metric.value)}`}
                  />
                </div>
              </div>
              <span className={`ml-3 text-sm font-semibold ${getHealthTextColor(metric.value)}`}>
                {metric.value}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
        >
          <h4 className="mb-2 text-sm font-semibold text-amber-400">Detected Anomalies</h4>
          <ul className="space-y-1">
            {anomalies.map((anomaly, index) => (
              <li key={index} className="flex gap-2 text-xs text-amber-300">
                <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />
                {anomaly}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
