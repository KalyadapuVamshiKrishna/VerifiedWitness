'use client';

import { motion } from 'framer-motion';
import { Copy, Download, Share2, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { VerificationReport } from '@/lib/types';
import { TrustScoreCard } from '@/components/verification/TrustScoreCard';
import { VerdictBadge } from '@/components/verification/VerdictBadge';
import { MetadataHealth } from '@/components/verification/MetadataHealth';
import { EvidenceTimeline } from '@/components/verification/EvidenceTimeline';
import { AIFindings } from '@/components/verification/AIFindings';
import { RecommendationPanel } from '@/components/verification/RecommendationPanel';

interface VerificationReportPageProps {
  report: VerificationReport;
  preview?: boolean;
}

export function VerificationReportPage({ report, preview = false }: VerificationReportPageProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metadata: true,
    findings: true,
    timeline: true,
    recommendations: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(report.id);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-background ${!preview ? 'min-h-screen' : ''}`}>
      <div className={`container-padding ${!preview ? 'section-spacing' : 'py-6'}`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Forensic Verification Report</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              File: <span className="text-foreground">{report.fileName}</span>
            </p>
          </div>

          {!preview && (
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          )}
        </motion.div>

        {/* Report ID and Metadata */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 md:grid-cols-4"
        >
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Report ID</div>
            <div className="mt-2 flex items-center justify-between">
              <code className="text-sm font-mono text-foreground">{report.id}</code>
              <button
                onClick={handleCopyId}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copy"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analyzed</div>
            <div className="mt-2 text-sm text-foreground">{formatDate(report.analyzedAt)}</div>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">File Size</div>
            <div className="mt-2 text-sm text-foreground">
              {(report.fileSize / (1024 * 1024)).toFixed(2)} MB
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Verdict</div>
            <div className="mt-2">
              <VerdictBadge verdict={report.verdict} size="sm" showLabel />
            </div>
          </div>
        </motion.div>

        {/* Trust Score Card - Center Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-lg border border-border bg-card/50 p-8"
        >
          <div className="flex flex-col items-center">
            <TrustScoreCard score={report.trustScore} verdict={report.verdict} />
          </div>
        </motion.div>

        {/* File Integrity Section - Centerpiece */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8 rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {report.fileIntegrity.verified ? (
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-400" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">File Integrity</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Status: <span className="text-amber-300 font-medium">{report.fileIntegrity.integrityStatus}</span>
              </p>
              <div className="mt-3 space-y-2">
                <div className="rounded bg-card/50 p-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SHA-256 Hash</div>
                  <code className="mt-1 block break-all text-xs font-mono text-amber-300">
                    {report.fileIntegrity.hash}
                  </code>
                </div>
                <div className="text-xs text-muted-foreground">
                  Generated: {report.fileIntegrity.generatedAt.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Evidence Quality Section - Centerpiece */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-lg border border-amber-500/30 bg-card/50 p-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Evidence Quality</h2>
              <p className="mt-1 text-sm text-muted-foreground">Reliability assessment of collected evidence</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-3xl font-bold text-amber-400">{report.evidenceQuality.overall}</div>
              <div className="text-xs font-medium text-amber-300 uppercase tracking-wider">{report.evidenceQuality.reliability}</div>
            </div>
          </div>

          {/* Quality Breakdown */}
          <div className="space-y-3">
            {report.evidenceQuality.metadataCompleteness > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Metadata Completeness</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${report.evidenceQuality.metadataCompleteness}%` }}
                    />
                  </div>
                  <span className="text-amber-300 font-semibold text-xs">{report.evidenceQuality.metadataCompleteness}%</span>
                </div>
              </div>
            )}

            {report.evidenceQuality.ocrCompleteness > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Text Evidence Completeness</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${report.evidenceQuality.ocrCompleteness}%` }}
                    />
                  </div>
                  <span className="text-amber-300 font-semibold text-xs">{report.evidenceQuality.ocrCompleteness}%</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Image Quality</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                    style={{ width: `${report.evidenceQuality.imageQualityScore}%` }}
                  />
                </div>
                <span className="text-amber-300 font-semibold text-xs">{report.evidenceQuality.imageQualityScore}%</span>
              </div>
            </div>

            {report.evidenceQuality.deviceCapabilityScore > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Device Capability Match</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${report.evidenceQuality.deviceCapabilityScore}%` }}
                    />
                  </div>
                  <span className="text-amber-300 font-semibold text-xs">{report.evidenceQuality.deviceCapabilityScore}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded bg-card p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {report.evidenceQuality.explanation}
            </p>
          </div>
        </motion.div>

        {/* Two-column layout for remaining sections */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-border bg-card/50 p-6"
            >
              <h2 className="text-lg font-semibold text-foreground">Summary</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
            </motion.div>

            {/* AI Findings */}
            {report.aiFindings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-lg border border-border bg-card/50 p-6"
              >
                <button
                  onClick={() => toggleSection('findings')}
                  className="flex w-full items-center justify-between"
                >
                  <h2 className="text-lg font-semibold text-foreground">AI Analysis</h2>
                  {expandedSections.findings ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.findings && (
                  <div className="mt-4">
                    <AIFindings findings={report.aiFindings} />
                  </div>
                )}
              </motion.div>
            )}

            {/* Timeline */}
            {report.timeline.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-lg border border-border bg-card/50 p-6"
              >
                <button
                  onClick={() => toggleSection('timeline')}
                  className="flex w-full items-center justify-between"
                >
                  <h2 className="text-lg font-semibold text-foreground">Evidence Timeline</h2>
                  {expandedSections.timeline ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.timeline && (
                  <div className="mt-4">
                    <EvidenceTimeline items={report.timeline} />
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Metadata Health */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {report.metadata && (
                <div className="rounded-lg border border-border bg-card/50 p-6">
                  <button
                    onClick={() => toggleSection('metadata')}
                    className="flex w-full items-center justify-between mb-4"
                  >
                    <h2 className="text-lg font-semibold text-foreground">Metadata Health</h2>
                    {expandedSections.metadata ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections.metadata && (
                    <MetadataHealth
                      integrity={report.metadataHealth.integrity}
                      consistency={report.metadataHealth.consistency}
                      completeness={report.metadataHealth.completeness}
                      anomalies={report.metadataHealth.anomalies}
                    />
                  )}
                </div>
              )}
            </motion.div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-lg border border-border bg-card/50 p-6"
              >
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="flex w-full items-center justify-between mb-4"
                >
                  <h2 className="text-lg font-semibold text-foreground">Recommendations</h2>
                  {expandedSections.recommendations ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                {expandedSections.recommendations && (
                  <RecommendationPanel recommendations={report.recommendations} />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
