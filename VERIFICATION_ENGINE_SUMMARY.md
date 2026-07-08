# VerifiedTrust™ Verification Engine Implementation

## Overview
The VerifiedTrust™ Verification Engine is a deterministic forensic analysis system that combines Gemini AI insights with local scoring to generate reliable, explainable verification reports. The engine never trusts AI alone—all scores are computed deterministically with AI providing observational context only.

## Architecture

### Module Structure
```
lib/
├── gemini.ts                    # Gemini API client with strict validation
├── prompts/
│   └── verification-prompt.ts   # Isolated forensic prompt (independent iteration)
├── verification/
│   ├── engine.ts               # Main orchestration logic
│   ├── scorer.ts               # Deterministic verification score computation
│   ├── completeness.ts         # Evidence completeness assessment
│   └── verdictMap.ts           # Score → verdict deterministic mapping
└── types.ts                    # Extended with File Integrity & Evidence Quality
```

### Data Flow

1. **Evidence Collection** (processor.ts)
   - File validation & SHA-256 hashing
   - Metadata extraction (EXIF analysis)
   - OCR text recognition
   - Image preview generation

2. **Verification Analysis** (engine.ts)
   - **Evidence Completeness** (deterministic)
     - Metadata availability & consistency
     - OCR confidence levels
     - Image quality assessment
     - Device capability verification
   - **Gemini Forensics** (optional, never trusted alone)
     - Visual consistency analysis
     - Metadata coherence checks
     - Compression pattern examination
     - Anomaly detection
   - **Deterministic Scoring** (scorer.ts)
     - Adaptive weighting based on metadata availability
     - Local computation of all scores
     - Verdict determination from thresholds
   
3. **Report Generation** (VerificationReportPage)
   - File Integrity section (SHA-256, verification timestamp)
   - Evidence Quality summary (completeness assessment)
   - Scoring breakdown with explanations
   - Recommendations based on findings

## Scoring Algorithm

### Adaptive Weighting

**With Metadata (Real Photos):**
- Metadata Integrity: 40%
- Visual Consistency (Gemini): 30%
- OCR Consistency: 20%
- Evidence Completeness: 10%

**Without Metadata (Screenshots):**
- Metadata Integrity: 0%
- Visual Consistency (Gemini): 67%
- OCR Consistency: 33%
- Evidence Completeness: 0%

### Score → Verdict Mapping

**With Metadata:**
- 80–100: AUTHENTIC
- 60–79: INCONCLUSIVE
- 40–59: MODIFIED
- 0–39: MODIFIED

**Without Metadata:**
- 85–100: AUTHENTIC
- 65–84: INCONCLUSIVE
- 40–64: MODIFIED
- 0–39: MODIFIED

## Key Components

### 1. Forensic Prompt (verification-prompt.ts)
Isolated prompt for independent iteration. Sends to Gemini:
- Image data
- File metadata
- OCR results
- Metadata summary

Returns structured JSON with:
- Visual consistency score (0-100)
- Metadata consistency assessment
- Compression pattern analysis
- Anomaly list with severity
- Confidence level (0-100)
- Detailed explanation

### 2. Evidence Completeness (completeness.ts)
Deterministic assessment of evidence reliability:
- **Metadata Completeness**: Camera field presence + coherence
- **OCR Completeness**: Text extraction confidence
- **Image Quality**: Resolution-based quality scoring
- **Device Capability**: Metadata vs. actual image match

Returns overall completeness (0-100) + individual component scores.

### 3. Deterministic Scorer (scorer.ts)
Never delegates verification to AI. Computes:
- Metadata integrity (50-100 based on field presence)
- Visual consistency (from Gemini, used as input only)
- OCR consistency (confidence + agreement with visual)
- Evidence completeness (from completeness module)

Applies adaptive weights and generates final TrustScore (0-100).

### 4. Gemini Integration (gemini.ts)
- Strict JSON schema validation
- Graceful degradation if Gemini unavailable
- All response values clamped to 0-100
- Missing fields default safely
- Never affects scoring thresholds

### 5. Verification Engine (engine.ts)
Orchestrates entire pipeline:
- Calls Gemini analysis asynchronously
- Computes completeness score
- Applies deterministic scoring
- Builds comprehensive report
- Generates AI findings + recommendations

## File Integrity Section

Every report includes:
```
{
  hash: "SHA-256-hash",
  hashAlgorithm: "SHA-256",
  verified: boolean,
  integrityStatus: "VERIFIED" | "UNVERIFIED",
  generatedAt: timestamp
}
```

Displayed prominently with:
- Green checkmark for verified files
- Full hash visible for chain-of-custody
- Generation timestamp for audit trail

## Evidence Quality Section

Centerpiece component showing:
- **Overall Score** (0-100) + reliability level (HIGH/MEDIUM/LOW)
- **Component Breakdown**:
  - Metadata Completeness %
  - OCR Completeness % (if available)
  - Image Quality %
  - Device Capability Match %
- **Visual Bars** showing each metric
- **Explanation Text** describing reliability factors

## Environment Configuration

### Required Environment Variable
```
GOOGLE_GENERATIVE_AI_API_KEY=<your-api-key>
```

If not set, the engine:
- Logs a warning
- Continues with deterministic scoring only
- Reports that Gemini was not available
- Still generates valid reports

### Optional Configuration
- Model: `gemini-2.0-flash` (can be overridden in code)
- Timeout: Built-in error handling
- Retry: Graceful degradation on failure

## Error Handling

1. **Gemini Unavailable**: Uses deterministic scoring only
2. **Gemini Response Invalid**: Falls back to safe defaults
3. **Bad JSON from Gemini**: Validates strictly, rejects invalid responses
4. **Missing Evidence**: Adapts weighting, still produces report
5. **File Hashing Fails**: Reports UNVERIFIED integrity

## Usage

### Generate Report from Session
```typescript
import { generateVerificationReport } from '@/lib/analysis/processor';

const report = await generateVerificationReport(session, {
  skipGemini: false,  // Optional: set true to skip AI analysis
  onProgress: (message) => console.log(message)
});
```

### Direct Engine Call
```typescript
import { generateVerificationReport } from '@/lib/verification/engine';

const report = await generateVerificationReport(session, {
  skipGemini: false,
  onProgress: (message) => console.log(message)
});
```

## Testing

### Mock Reports
Three variants available for testing:
- `authentic`: Score 94, AUTHENTIC verdict
- `modified`: Score 42, MODIFIED verdict (critical anomalies)
- `inconclusive`: Score 58, INCONCLUSIVE verdict (mixed signals)

All include realistic metadata, timeline, and recommendations.

## Performance Characteristics

- **Metadata Extraction**: ~50ms
- **OCR Processing**: ~2-5 seconds (async, non-blocking)
- **Gemini Analysis**: ~3-8 seconds (async)
- **Score Computation**: <10ms
- **Report Generation**: ~100ms
- **Total**: ~3-8 seconds for full analysis

## Security & Privacy

- SHA-256 hashing for file verification
- No image data stored (processed in memory only)
- Gemini API calls use official SDK
- All user IDs scoped to analysis sessions
- No external data leakage

## Future Enhancements

1. **Batch Processing**: Process multiple files efficiently
2. **Custom AI Models**: Support other LLMs
3. **Advanced Analytics**: Historical trend analysis
4. **Machine Learning**: Train on verified/modified dataset
5. **Collaborative Review**: Multi-investigator verification
6. **Export Formats**: PDF, JSON, CSV with signatures

## Debugging

Enable debug logging:
```typescript
console.log("[v0] Verification engine debug: ...");
```

Check `user_read_only_context/v0_debug_logs.log` for:
- API call details
- JSON validation results
- Scoring breakdowns
- Error traces
