import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Form {
  label: string;
  code: string;
  script: string;
  text: string;
  tokens: string[];
  count: number;
  multiplier: number;
}

interface TokenizationExample {
  tokenizer: string;
  forms: Form[];
}

// Color each form to match the fertility scatter: Latin teal, Arabic amber.
const FORM_COLOR = (script: string, isEnglish: boolean) =>
  isEnglish ? '#004655' : script === 'Arabic' ? '#d97706' : '#13677b';

/** Render a single token as an animated chip. Whitespace is made visible. */
function TokenChip({ token, color, delay }: { token: string; color: string; delay: number }) {
  const leadingSpace = token.startsWith(' ');
  const display = token.trim() === '' ? '␣' : token.replace(/^\s+/, '');
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 380, damping: 22 }}
      dir="auto"
      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[13px] font-mono leading-none border"
      style={{
        color,
        borderColor: `${color}33`,
        background: `${color}0f`,
      }}
    >
      {leadingSpace && <span className="opacity-30 mr-0.5">·</span>}
      {display}
    </motion.span>
  );
}

function FormRow({ form, isEnglish, maxCount, replayKey }: {
  form: Form; isEnglish: boolean; maxCount: number; replayKey: number;
}) {
  const color = FORM_COLOR(form.script, isEnglish);
  const stagger = 0.018;

  return (
    <div className="py-5 border-t border-outline-variant/10 first:border-t-0">
      {/* Header: label, count, multiplier, animated bar */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-headline font-bold" style={{ color }}>{form.label}</span>
          <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
            style={{ color, background: `${color}14` }}>
            {form.script}
          </span>
        </div>
        <div className="flex items-baseline gap-3 shrink-0">
          <span className="text-2xl font-headline font-extrabold" style={{ color }}>{form.count}</span>
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">tokens</span>
          <span className="text-sm font-bold px-2 py-0.5 rounded-md"
            style={{ color, background: `${color}14` }}>
            ×{form.multiplier.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Animated proportional bar */}
      <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden mb-3">
        <motion.div
          key={`bar-${replayKey}`}
          initial={{ width: 0 }}
          animate={{ width: `${(form.count / maxCount) * 100}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>

      {/* Original sentence */}
      <p dir="auto" className="text-xs text-on-surface-variant font-body mb-2 truncate" title={form.text}>
        {form.text}
      </p>

      {/* Token chips */}
      <div key={`chips-${replayKey}`} className="flex flex-wrap gap-1">
        {form.tokens.map((t, i) => (
          <TokenChip key={i} token={t} color={color} delay={i * stagger} />
        ))}
      </div>
    </div>
  );
}

export default function TokenizationDemo() {
  const [data, setData] = useState<TokenizationExample | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    fetch('/data/tokenization_example.json')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: TokenizationExample) => { setData(d); setStatus('ready'); })
      .catch(() => setStatus('missing'));
  }, []);

  if (status === 'missing') {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 text-sm text-on-surface-variant font-label">
        <p className="font-semibold text-on-surface mb-2">How Tokenization Drives Fertility</p>
        <p className="leading-relaxed">
          No example data found. Run{' '}
          <code className="text-on-surface">python scratch/build_tokenization_example.py</code> to generate{' '}
          <code className="text-on-surface">tokenization_example.json</code>.
        </p>
      </div>
    );
  }

  const maxCount = data ? Math.max(...data.forms.map((f) => f.count)) : 1;

  return (
    <div className="bg-surface-container-low rounded-xl p-8">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="max-w-3xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">
            How Tokenization Drives Fertility
          </h3>
          <p className="text-xs text-on-surface-variant font-body mt-1">
            The <strong>same sentence</strong>, same meaning, in three forms — tokenized by{' '}
            <code className="text-on-surface">{data?.tokenizer}</code>. Watch how many tokens the model spends as
            the language and script change: clean whole words in English, fragments in Minangkabau-Latin, and
            near-single characters in Minangkabau-Arabic. That count, per sentence, <em>is</em> fertility.
          </p>
        </div>
        <button
          onClick={() => setReplayKey((k) => k + 1)}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 transition"
        >
          <span className="material-symbols-outlined text-[16px]">replay</span>
          Replay
        </button>
      </div>

      {status === 'loading' || !data ? (
        <div className="h-64 flex items-center justify-center text-on-surface-variant/40 text-xs uppercase tracking-widest font-bold">
          Loading example…
        </div>
      ) : (
        <>
          <div className="mt-4">
            {data.forms.map((form, i) => (
              <FormRow
                key={form.code}
                form={form}
                isEnglish={i === 0}
                maxCount={maxCount}
                replayKey={replayKey}
              />
            ))}
          </div>
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200/50 text-amber-900 text-xs">
            <p className="leading-relaxed opacity-90">
              Same information, but the model spends <strong>{data.forms.map((f) => f.count).join(' vs ')} tokens</strong>{' '}
              depending only on language and script. Each Arabic-script fragment carries almost no standalone
              meaning, so the sentence embedding never forms cleanly — which is exactly why the Arabic variants
              collapse in the alignment scatter above.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
