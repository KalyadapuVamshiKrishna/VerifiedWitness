'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle2, AlertCircle, Loader, X } from 'lucide-react';
import Link from 'next/link';
import { processFile } from '@/lib/analysis/processor';
import { AnalysisSession } from '@/lib/analysis/session';

export default function AnalyzePage() {
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setAnalysisError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'],
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const session = await processFile(selectedFile, {
        skipOCR: false,
        onProgress: (updatedSession) => {
          setSessions((prev) => {
            const index = prev.findIndex((s) => s.id === updatedSession.id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = updatedSession;
              return updated;
            }
            return [...prev, updatedSession];
          });
        },
      });

      setSessions([session]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setAnalysisError(errorMessage);
      console.error('[v0] Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSessions([]);
    setAnalysisError(null);
  };

  const currentSession = sessions.length > 0 ? sessions[0] : null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="container-padding section-spacing">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground">Upload & Analyze</h1>
          <p className="mt-2 text-muted-foreground">
            Drag and drop images or click to select files for forensic verification
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                isDragActive
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-border hover:border-muted-foreground hover:bg-muted/30'
              }`}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                  <Upload className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedFile
                    ? 'File selected'
                    : isDragActive
                      ? 'Drop file here'
                      : 'Drag file here or click to select'}
                </h3>
                {selectedFile && (
                  <p className="mt-2 text-sm text-amber-400 font-medium">{selectedFile.name}</p>
                )}
                {!selectedFile && (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Supported formats: JPG, PNG, GIF, BMP, WebP, TIFF, PDF
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Maximum 50MB per file</p>
                  </>
                )}
              </div>
            </motion.div>

            {/* Selected File */}
            <AnimatePresence>
              {selectedFile && !isAnalyzing && sessions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-6 rounded-lg border border-border bg-card/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing Console */}
            <AnimatePresence>
              {currentSession && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-6 rounded-lg border border-border bg-card/50 p-6 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    {currentSession.overallStatus === 'ERROR' ? (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    ) : currentSession.overallStatus === 'READY' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <Loader className="h-5 w-5 text-amber-400 animate-spin" />
                    )}
                    <h3 className="font-semibold text-foreground">
                      {currentSession.overallStatus === 'ERROR'
                        ? 'Evidence Acquisition Failed'
                        : currentSession.overallStatus === 'READY'
                          ? 'Evidence Collection Complete'
                          : 'Acquiring Evidence'}
                    </h3>
                  </div>

                  {/* Processing Stages */}
                  <div className="space-y-3">
                    {['validation', 'metadata', 'ocr'].map((stage) => {
                      const stageStatus = currentSession.stages[stage as keyof typeof currentSession.stages];
                      const isCompleted = stageStatus.status === 'COMPLETED';
                      const isFailed = stageStatus.status === 'FAILED';
                      const isRunning = stageStatus.status === 'RUNNING';

                      const stageLabels = {
                        validation: 'File Validation',
                        metadata: 'Evidence Metadata',
                        ocr: 'Text Evidence',
                      };

                      return (
                        <div key={stage} className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-5 flex items-center justify-center">
                            {isFailed ? (
                              <AlertCircle className="h-4 w-4 text-red-400" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : isRunning ? (
                              <Loader className="h-4 w-4 text-amber-400 animate-spin" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {stageLabels[stage as keyof typeof stageLabels]}
                            </p>
                            {isFailed && stageStatus.error && (
                              <p className="text-xs text-red-400 mt-1">{stageStatus.error}</p>
                            )}
                            {isRunning && stageStatus.progress > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">{stageStatus.progress}%</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Warnings */}
                  <AnimatePresence>
                    {currentSession.warnings.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded bg-yellow-500/10 border border-yellow-500/20 p-3"
                      >
                        <p className="text-xs font-medium text-yellow-600 mb-2">Warnings:</p>
                        <ul className="space-y-1">
                          {currentSession.warnings.map((w, i) => (
                            <li key={i} className="text-xs text-yellow-600">
                              • {w.message}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    {currentSession.overallStatus === 'READY' && (
                      <>
                        <Link
                          href="/report"
                          className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors"
                        >
                          View Report
                        </Link>
                        <button
                          onClick={handleReset}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors"
                        >
                          Analyze Another
                        </button>
                      </>
                    )}
                    {currentSession.overallStatus === 'ERROR' && (
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
              {analysisError && !currentSession && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4"
                >
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-600">Analysis Error</p>
                      <p className="text-xs text-red-500 mt-1">{analysisError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            {selectedFile && !isAnalyzing && sessions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex gap-3"
              >
                <button
                  onClick={handleAnalyze}
                  className="flex-1 rounded-lg bg-amber-600 hover:bg-amber-700 px-6 py-3 font-semibold text-white transition-colors"
                >
                  Start Analysis
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="rounded-lg border border-border bg-card hover:bg-muted px-6 py-3 font-semibold text-foreground transition-colors"
                >
                  Clear
                </button>
              </motion.div>
            )}
          </div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Analysis Info */}
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h3 className="font-semibold text-foreground mb-3">Evidence Collected</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-amber-400">→</span>
                  <span>File hash (SHA-256)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400">→</span>
                  <span>Complete EXIF metadata</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400">→</span>
                  <span>Image dimensions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400">→</span>
                  <span>GPS coordinates</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400">→</span>
                  <span>Extracted text (Text Evidence)</span>
                </li>
              </ul>
            </div>

            {/* Privacy Info */}
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h3 className="font-semibold text-foreground mb-2">Privacy & Security</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All processing happens in your browser. Files are never uploaded to any server. No data is retained after analysis completes.
              </p>
            </div>

            {/* Processing Info */}
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h3 className="font-semibold text-foreground mb-2">Processing</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="text-green-400">✓</span> Evidence Metadata: Instant</p>
                <p><span className="text-amber-400">⟳</span> Text Evidence: 10-30 seconds</p>
                <p><span className="text-muted-foreground">→</span> PDF Support: Coming soon</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
