import {
  GEMMA_SCORES,
  MISTRAL_VS_MIXTRAL_SCORES,
  VARIANT_COLUMNS,
  type ModelRow,
  type Score,
  type Variant,
} from './Overview';

/* ── Shared helpers (same conventions as Overview) ── */
const fmt = (v: Score) => (v === null || v === undefined ? '—' : v.toFixed(4));

const columnMaxima = (rows: ModelRow[]): Record<Variant, { max: Score; mean: Score }> => {
  const out = {} as Record<Variant, { max: Score; mean: Score }>;
  for (const v of VARIANT_COLUMNS) {
    let mx: Score = null, mn: Score = null;
    for (const r of rows) {
      const c = r.scores[v.key];
      if (c?.max != null) mx = mx === null ? c.max : Math.max(mx, c.max);
      if (c?.mean != null) mn = mn === null ? c.mean : Math.max(mn, c.mean);
    }
    out[v.key] = { max: mx, mean: mn };
  }
  return out;
};

/* ── Reusable score table (Models × Dataset Variants) ── */
function ScoreTable({ rows }: { rows: ModelRow[] }) {
  const maxima = columnMaxima(rows);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/30">
            <th
              rowSpan={2}
              className="text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-4 py-3 align-bottom"
            >
              Model
            </th>
            {VARIANT_COLUMNS.map((v) => (
              <th
                key={v.key}
                colSpan={2}
                className="text-center text-[10px] font-bold uppercase tracking-widest text-primary px-4 pt-3 pb-1 border-l border-outline-variant/20"
              >
                <div>{v.label}</div>
                <div className="text-[9px] font-medium normal-case tracking-normal text-on-surface-variant/70 mt-0.5">
                  {v.subtitle}
                </div>
              </th>
            ))}
          </tr>
          <tr className="border-b border-outline-variant/30">
            {VARIANT_COLUMNS.flatMap((v) => [
              <th
                key={`${v.key}-max`}
                className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20"
              >
                µ_Max
              </th>,
              <th
                key={`${v.key}-mean`}
                className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2"
              >
                µ_Mean
              </th>,
            ])}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.model}
              className={`border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors ${
                idx === rows.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <td className="px-4 py-3">
                <div className="font-headline font-semibold text-on-surface">{row.model}</div>
                {row.note && (
                  <div className="text-[10px] font-body text-on-surface-variant/70 italic mt-0.5">
                    {row.note}
                  </div>
                )}
              </td>
              {VARIANT_COLUMNS.flatMap((v) => {
                const cell = row.scores[v.key];
                const boldMax = cell.max !== null && cell.max === maxima[v.key].max;
                const boldMean = cell.mean !== null && cell.mean === maxima[v.key].mean;
                return [
                  <td
                    key={`${row.model}-${v.key}-max`}
                    className={`text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 ${
                      cell.max === null ? 'text-on-surface-variant/30 font-medium' : boldMax ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                    }`}
                  >
                    {fmt(cell.max)}
                  </td>,
                  <td
                    key={`${row.model}-${v.key}-mean`}
                    className={`text-right font-mono tabular-nums text-base px-3 py-3 ${
                      cell.mean === null ? 'text-on-surface-variant/30 font-medium' : boldMean ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                    }`}
                  >
                    {fmt(cell.mean)}
                  </td>,
                ];
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Numbered thesis-findings list ── */
function FindingsList({ findings }: { findings: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="space-y-4 mt-6">
      {findings.map((f, i) => (
        <li key={i} className="flex gap-4">
          <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-headline font-bold text-sm flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <div>
            <div className="font-headline font-semibold text-on-surface text-sm">{f.title}</div>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed mt-1">{f.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Page ── */
export default function MoeAnalysis() {
  return (
    <div className="p-12 space-y-12">
      {/* Header */}
      <div className="max-w-5xl">
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-3">
          Mixture-of-Experts & Cross-Lingual Alignment
        </h2>
        <p className="text-xs text-on-surface-variant font-body leading-relaxed">
          Sparse Mixture-of-Experts (MoE) models replace each dense feed-forward block with a
          pool of expert networks and a learned router that activates only a few experts per
          token. For MEXA this raises a specific question: if parallel sentences in different
          languages are routed to <em>different</em> experts, do their hidden representations
          still converge on a shared (English-pivot) semantic space? The two families below
          give opposite answers — evidence that the outcome depends on training recipe and
          expert design, not on the MoE architecture per se.
        </p>
      </div>

      {/* ── Family 1: Gemma 4 ── */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3">
            Gemma 4 Family — MoE vs. Dense at Matched Active & Total Parameters
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            The Gemma 4 release spans dense models (E2B, E4B, 12B, 31B) around the sparse
            MoE <strong>26B-A4B</strong> (25.2B total, 3.8B active per token via 8-of-128
            routing plus one shared expert). This uniquely allows two controlled contrasts
            within one family and one training recipe: <strong>E4B vs. 26B-A4B</strong> matches{' '}
            <em>active</em> parameters (~4B), and <strong>31B vs. 26B-A4B</strong> matches{' '}
            <em>total</em> parameters.
          </p>
        </div>

        <ScoreTable rows={GEMMA_SCORES} />

        <FindingsList
          findings={[
            {
              title: 'At matched active parameters (E4B vs. 26B-A4B), the MoE wins.',
              body: (
                <>
                  0.8840 vs. 0.8719 µ_Max on FLORES Table 1 — and dramatically so on µ_Mean
                  (0.6291 vs. 0.4995). Expert routing doesn't fragment cross-lingual alignment
                  here; it seems to <em>help</em> per unit of compute.
                </>
              ),
            },
            {
              title: 'At matched total parameters (31B vs. 26B-A4B), dense wins on peak alignment.',
              body: (
                <>
                  0.9189 vs. 0.8840 µ_Max — but the MoE still holds the family's best µ_Mean
                  (0.6291 vs. 0.5782): its alignment is sustained across many layers rather
                  than concentrated at one peak.
                </>
              ),
            },
            {
              title: 'The Bible result is a standout for low-resource languages.',
              body: (
                <>
                  0.7140 µ_Max is by far the best Bible Table 1 score of any causal LM evaluated
                  (Qwen3.5 9B: 0.4821, Llama 3.1 8B: 0.4180) — approaching encoder territory
                  (LaBSE: 0.8392) on low-resource languages.
                </>
              ),
            },
          ]}
        />
      </section>

      {/* ── Family 2: Mistral / Mixtral ── */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3">
            Mistral Family — Dense 7B vs. Mixtral 8x7B & 8x22B (Sparse MoE)
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            <strong>Mixtral 8x7B</strong> (~47B total, ~12.9B active per token via 2-of-8
            routing) and <strong>Mixtral 8x22B</strong> (~141B total, ~39B active) are built
            directly on the dense <strong>Mistral 7B</strong> architecture, making this the
            classic dense-vs-MoE comparison — an earlier-generation design without a shared
            expert and with far coarser routing (8 large experts vs. Gemma's 128 fine-grained
            ones). The 8x22B adds a second axis: what does a 3× scale-up of the same MoE
            recipe buy?
          </p>
        </div>

        <ScoreTable rows={MISTRAL_VS_MIXTRAL_SCORES} />

        <FindingsList
          findings={[
            {
              title: 'Capacity without alignment gains: 6.7× the parameters, same MEXA score.',
              body: (
                <>
                  Mixtral (0.4831 µ_Max, FLORES Table 1) performs on par with — even slightly
                  below — its dense 7B sibling (0.4980), despite nearly double the active compute
                  and 6.7× the total capacity. The extra expert capacity does not translate into
                  a better shared cross-lingual space.
                </>
              ),
            },
            {
              title: 'Scaling the MoE 3× barely moves high-resource alignment.',
              body: (
                <>
                  Mixtral 8x22B — 141B total parameters, 20× the dense baseline — reaches just
                  0.5184 µ_Max on FLORES Table 1, a marginal +0.02 over dense Mistral 7B. For
                  perspective, Gemma 4 E2B achieves 0.8574 with ~2B effective parameters:
                  within the Mixtral recipe, cross-lingual alignment is essentially
                  scale-invariant, so recipe and routing design dominate raw capacity.
                </>
              ),
            },
            {
              title: 'No layer-depth advantage at any scale.',
              body: (
                <>
                  µ_Mean is flat-to-declining across the family (0.2878 dense → 0.2787 8x7B →
                  0.2686 8x22B) — unlike Gemma 4's MoE, Mixtral's routing never produces
                  sustained multi-layer alignment, no matter how large the experts grow.
                </>
              ),
            },
            {
              title: 'On the lowest-resource languages, the small MoE actively collapses…',
              body: (
                <>
                  On Bible Full, Mixtral 8x7B drops to 0.0126 µ_Max vs. Mistral's 0.0465 — a ~4×
                  degradation. A plausible mechanism: for languages barely seen in training, the
                  router lacks stable expert assignments, so parallel sentences scatter across
                  divergent expert paths and hidden states fail to align.
                </>
              ),
            },
            {
              title: '…but scale rescues exactly this low-resource regime.',
              body: (
                <>
                  Bible Table 1 jumps from 0.2716 (8x7B) to 0.4403 (8x22B) — a +62% gain that
                  overtakes Llama 3.1 8B (0.4180) and approaches Qwen3.5 9B (0.4821), even
                  though high-resource FLORES barely improved. With the same 8-expert routing,
                  the extra per-expert capacity appears to stabilize representations for rare
                  languages — suggesting the 8x7B collapse was a capacity bottleneck inside
                  experts, not routing fragmentation alone.
                </>
              ),
            },
          ]}
        />
      </section>

      {/* ── Synthesis ── */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <div className="max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3">
            Synthesis — Routing Design Decides, Not Sparsity Itself
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            The two families falsify the simple hypothesis that "MoE routing fragments
            cross-lingual alignment." Mixtral 8x7B (coarse 2-of-8 routing, no shared expert,
            2023-era data mix) shows the collapse pattern — and Mixtral 8x22B shows that
            scaling the same recipe 3× does not fix it (0.5184 µ_Max at 141B total, still ~0.37
            below a 2B-effective Gemma). Meanwhile Gemma 4 26B-A4B (fine-grained 8-of-128
            routing <em>plus a shared expert</em> that every token passes through, and a
            heavily multilingual recipe) is the strongest causal LM in the entire evaluation.
            The shared expert is the architectural suspect worth highlighting in the thesis: it
            guarantees a common representational pathway for all languages regardless of routing
            decisions, giving the model a place to maintain the English-pivot semantic space
            while specialist experts handle language-specific surface forms.
          </p>
        </div>
      </section>
    </div>
  );
}
