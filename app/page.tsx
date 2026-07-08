'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FileCheck, Zap, Shield } from 'lucide-react';
import Link from 'next/link';
import { VerificationReportPage } from '@/components/pages/VerificationReportPage';
import { mockVerificationReport } from '@/lib/mock/report';

export default function Page() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-amber-500/5 to-transparent pt-20 pb-12">
        <div className="container-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-4 py-1.5 mb-6">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-300">Professional Forensic Verification</span>
            </div>

            <h1 className="text-5xl font-bold text-foreground">
              Digital Authenticity Verification
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Advanced forensic analysis for investigative teams. Verify image authenticity with AI-powered insights and detailed metadata analysis.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 px-6 py-3 font-semibold text-white transition-colors"
              >
                Start Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-muted px-6 py-3 font-semibold text-foreground transition-colors">
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-padding section-spacing">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {[
            {
              icon: FileCheck,
              title: 'Evidence Metadata',
              description: 'Complete EXIF, IPTC, and XMP analysis with integrity verification.',
            },
            {
              icon: Zap,
              title: 'Forensic Analysis',
              description: 'Machine learning models detect compression anomalies and manipulation patterns.',
            },
            {
              icon: Shield,
              title: 'Verification Score',
              description: 'Quantified authenticity assessment with detailed confidence metrics.',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="rounded-lg border border-border bg-card/50 p-6"
              >
                <Icon className="h-6 w-6 text-amber-400 mb-3" />
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Live Preview Section */}
      <section className="border-t border-border bg-gradient-to-b from-transparent to-amber-500/5">
        <div className="container-padding py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-foreground">
              Example Verification Report
            </h2>
            <p className="mt-2 text-muted-foreground">
              See what a complete forensic analysis looks like
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="rounded-lg border border-border overflow-hidden bg-card/50 shadow-xl"
          >
            <div className="max-h-[600px] overflow-y-auto">
              <VerificationReportPage report={mockVerificationReport} preview={true} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-padding section-spacing">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-lg border border-border bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-foreground">Ready to verify?</h2>
          <p className="mt-2 text-muted-foreground">
            Upload an image to begin forensic analysis
          </p>
          <Link
            href="/analyze"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 px-8 py-3 font-semibold text-white transition-colors"
          >
            Upload Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>
    </>
  );
}
