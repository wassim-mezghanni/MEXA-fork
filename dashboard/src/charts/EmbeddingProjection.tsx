import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayerSlider } from '../form/LayerSlider';

const Plot = lazy(() => import('react-plotly.js'));

/* ── Types ── */
interface PointData {
  pca: [number, number];
  tsne: [number, number];
  pca3d?: [number, number, number];
  tsne3d?: [number, number, number];
}

interface ProjectionData {
  languages: string[];
  num_layers: number;
  layers: Record<string, {
    points: Record<string, PointData>;
    pca_variance: number[];
    pca3d_variance?: number[];
  }>;
}

interface EmbeddingProjectionProps {
  dataPath: string;
  languageNames?: Record<string, string>;
  scores?: Record<string, number>;
  title?: string;
  subtitle?: string;
  className?: string;
}

/* ── Helpers ── */
function getScript(code: string) {
  const parts = code.split('_');
  return parts.length > 1 ? parts[1] : 'Unknown';
}

const SCRIPT_COLORS: Record<string, string> = {
  Latn: '#004655', Cyrl: '#0a9396', Arab: '#ee9b00', Deva: '#bb3e03',
  Hans: '#ae2012', Hant: '#ca6702', Beng: '#9b2226', Jpan: '#005f73',
  Hang: '#94d2bd', Thai: '#e9d8a6', Grek: '#001219', Hebr: '#0a9396',
  Geor: '#005f73', Ethi: '#9b2226', Taml: '#bb3e03', Mlym: '#ae2012',
  Telu: '#ca6702', Knda: '#ee9b00', Guru: '#e9d8a6', Mymr: '#94d2bd',
  Khmr: '#0a9396', Sinh: '#001219', Tibt: '#005f73', Armn: '#9b2226',
  Laoo: '#bb3e03', Orya: '#ae2012', Gujr: '#ca6702', Tfng: '#e9d8a6',
  Olck: '#94d2bd',
};

const FALLBACK_COLOR = '#b9c9cf';

function scoreToColor(score: number): string {
  if (score >= 0.8) return '#004655';
  if (score >= 0.6) return '#005f73';
  if (score >= 0.4) return '#0a9396';
  if (score >= 0.2) return '#ee9b00';
  return '#ae2012';
}

function getColor(code: string, colorMode: 'script' | 'score', scores: Record<string, number>) {
  if (colorMode === 'score' && scores[code] !== undefined) return scoreToColor(scores[code]);
  return SCRIPT_COLORS[getScript(code)] || FALLBACK_COLOR;
}

/* ── 2D Custom Tooltip ── */
function CustomTooltip({ active, payload, languageNames, scores }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface-container-lowest p-3 rounded-lg shadow-xl border border-outline-variant/10">
      <div className="font-headline font-bold text-sm text-primary">{d.name}</div>
      <div className="font-mono text-[10px] text-on-surface-variant">{d.code}</div>
      <div className="mt-1.5 space-y-0.5">
        <div className="text-[10px] text-on-surface-variant">
          Script: <span className="font-bold text-on-surface">{d.script}</span>
        </div>
        {scores?.[d.code] !== undefined && (
          <div className="text-[10px] text-on-surface-variant">
            MEXA: <span className="font-bold text-on-surface">{scores[d.code].toFixed(3)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 2D Custom Dot ── */
function RenderDot(props: any) {
  const { cx, cy, payload } = props;
  const isEnglish = payload.code === 'eng_Latn';
  const r = isEnglish ? 6 : 3.5;
  return (
    <g>
      <circle
        cx={cx} cy={cy} r={r} fill={payload.color}
        opacity={0.85}
        stroke={isEnglish ? '#fff' : 'none'}
        strokeWidth={isEnglish ? 2 : 0}
      />
      {isEnglish && (
        <text x={cx + 10} y={cy + 4} fontSize={10} fontWeight="bold" fill="#004655">English</text>
      )}
    </g>
  );
}

/* ── 3D Scene via Plotly ── */
function Scatter3D({
  languages,
  layerPoints,
  languageNames,
  scores,
  colorMode,
  method,
  searchQuery,
  hoveredScript,
}: {
  languages: string[];
  layerPoints: Record<string, PointData>;
  languageNames: Record<string, string>;
  scores: Record<string, number>;
  colorMode: 'script' | 'score';
  method: 'pca' | 'tsne';
  searchQuery: string;
  hoveredScript: string | null;
}) {
  const key3d = method === 'pca' ? 'pca3d' : 'tsne3d';

  const filtered = languages.filter(code => {
    if (!searchQuery) return true;
    const name = (languageNames[code] || code).toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || code.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group by script for separate traces (enables legend toggling)
  const scriptGroups: Record<string, { codes: string[]; color: string }> = {};
  filtered.forEach(code => {
    const coords = layerPoints[code]?.[key3d];
    if (!coords) return;
    const script = getScript(code);
    if (!scriptGroups[script]) {
      scriptGroups[script] = { codes: [], color: getColor(code, colorMode, scores) };
    }
    scriptGroups[script].codes.push(code);
  });

  const traces = Object.entries(scriptGroups).map(([script, group]) => {
    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[] = [];
    const texts: string[] = [];
    const colors: string[] = [];
    const sizes: number[] = [];

    group.codes.forEach(code => {
      const coords = layerPoints[code][key3d]!;
      xs.push(coords[0]);
      ys.push(coords[1]);
      zs.push(coords[2]);

      const name = languageNames[code] || code;
      const scoreStr = scores[code] !== undefined ? `<br>MEXA: ${scores[code].toFixed(3)}` : '';
      texts.push(`<b>${name}</b><br>${code}<br>Script: ${script}${scoreStr}`);

      const c = getColor(code, colorMode, scores);
      colors.push(c);

      const isEnglish = code === 'eng_Latn';
      sizes.push(isEnglish ? 8 : 4);
    });

    const dimmed = hoveredScript !== null && hoveredScript !== script;

    return {
      type: 'scatter3d' as const,
      mode: 'markers' as const,
      name: script,
      x: xs,
      y: ys,
      z: zs,
      text: texts,
      hoverinfo: 'text' as const,
      marker: {
        size: sizes,
        color: colors,
        opacity: dimmed ? 0.1 : 0.85,
        line: { width: 0 },
      },
    };
  });

  const axisStyle = {
    backgroundcolor: 'rgba(0,0,0,0)',
    gridcolor: 'rgba(0,0,0,0.06)',
    zerolinecolor: 'rgba(0,0,0,0.08)',
    showspikes: false,
    tickfont: { size: 9, color: '#6b7280' },
    titlefont: { size: 10, color: '#6b7280' },
  };

  const layout: any = {
    autosize: true,
    height: 560,
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    scene: {
      xaxis: { title: method === 'pca' ? 'PC1' : 'Dim 1', ...axisStyle },
      yaxis: { title: method === 'pca' ? 'PC2' : 'Dim 2', ...axisStyle },
      zaxis: { title: method === 'pca' ? 'PC3' : 'Dim 3', ...axisStyle },
      camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
      bgcolor: 'rgba(0,0,0,0)',
    },
    showlegend: true,
    legend: {
      font: { size: 9, family: 'monospace' },
      bgcolor: 'rgba(255,255,255,0.7)',
      borderwidth: 0,
      itemsizing: 'constant',
    },
  };

  return (
    <Suspense fallback={
      <div className="h-[560px] flex items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
        Loading 3D renderer...
      </div>
    }>
      <Plot
        data={traces}
        layout={layout}
        config={{
          displayModeBar: true,
          modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'],
          displaylogo: false,
          responsive: true,
        }}
        style={{ width: '100%', height: '560px' }}
        useResizeHandler
      />
    </Suspense>
  );
}

/* ── Main Component ── */
export function EmbeddingProjection({
  dataPath,
  languageNames = {},
  scores = {},
  title = 'Embedding Projection',
  subtitle,
  className = '',
}: EmbeddingProjectionProps) {
  const [data, setData] = useState<ProjectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layer, setLayer] = useState(0);
  const [method, setMethod] = useState<'pca' | 'tsne'>('pca');
  const [colorMode, setColorMode] = useState<'script' | 'score'>('script');
  const [dims, setDims] = useState<'2d' | '3d'>('3d');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredScript, setHoveredScript] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(dataPath)
      .then(r => {
        if (!r.ok) throw new Error('Projection data not found. Run compute_projections.py first.');
        return r.json();
      })
      .then((d: ProjectionData) => {
        setData(d);
        setLayer(Math.floor(d.num_layers / 2));
        // Check if 3D data exists
        const firstLayer = Object.values(d.layers)[0];
        const firstPoint = firstLayer && Object.values(firstLayer.points)[0];
        if (!firstPoint?.pca3d) setDims('2d');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [dataPath]);

  /* ── 2D scatter data ── */
  const scatterData2D = useMemo(() => {
    if (!data || dims !== '2d') return [];
    const layerData = data.layers[String(layer)];
    if (!layerData) return [];

    return data.languages
      .filter(code => {
        if (!searchQuery) return true;
        const name = (languageNames[code] || code).toLowerCase();
        return name.includes(searchQuery.toLowerCase()) || code.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .map(code => {
        const coords = layerData.points[code]?.[method];
        if (!coords) return null;
        return {
          code,
          name: languageNames[code] || code,
          script: getScript(code),
          x: coords[0],
          y: coords[1],
          color: getColor(code, colorMode, scores),
          dimmed: hoveredScript ? getScript(code) !== hoveredScript : false,
        };
      })
      .filter(Boolean);
  }, [data, layer, method, colorMode, languageNames, scores, searchQuery, hoveredScript, dims]);

  const pcaVariance = useMemo(() => {
    if (!data || method !== 'pca') return null;
    const ld = data.layers[String(layer)];
    return dims === '3d' ? ld?.pca3d_variance : ld?.pca_variance;
  }, [data, layer, method, dims]);

  const scriptLegend = useMemo(() => {
    if (!data) return [];
    const counts: Record<string, number> = {};
    data.languages.forEach(code => {
      const s = getScript(code);
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([script, count]) => ({
        script, count,
        color: SCRIPT_COLORS[script] || FALLBACK_COLOR,
      }));
  }, [data]);

  const has3D = useMemo(() => {
    if (!data) return false;
    const firstLayer = Object.values(data.layers)[0];
    const firstPoint = firstLayer && Object.values(firstLayer.points)[0];
    return !!firstPoint?.pca3d;
  }, [data]);

  const handleLayerChange = useCallback((v: number | [number, number]) => {
    setLayer(typeof v === 'number' ? v : v[0]);
  }, []);

  if (loading) {
    return (
      <div className={`bg-surface-container-low p-8 rounded-xl ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-surface-container-high rounded-lg" />
          <div className="h-96 bg-surface-container-high rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`bg-surface-container-low p-8 rounded-xl ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl">cloud_off</span>
          <p className="text-sm font-body">{error || 'No projection data available'}</p>
          <p className="text-xs font-mono">Run: python compute_projections.py --embedding_path ./embeddings --output_json {dataPath}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-container-low p-8 rounded-xl ${className}`}>
      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-on-surface-variant font-label italic">
            {subtitle || `${data.languages.length} languages projected from ${data.num_layers} layers`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {/* 2D / 3D toggle */}
          {has3D && (
            <div className="bg-surface-container-lowest rounded-lg p-1 flex gap-0.5">
              {(['2d', '3d'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDims(d)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                    dims === d
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* PCA / t-SNE */}
          <div className="bg-surface-container-lowest rounded-lg p-1 flex gap-0.5">
            {(['pca', 'tsne'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                  method === m
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {m === 'pca' ? 'PCA' : 't-SNE'}
              </button>
            ))}
          </div>

          {/* Script / Score color */}
          <div className="bg-surface-container-lowest rounded-lg p-1 flex gap-0.5">
            {([
              { key: 'script' as const, label: 'Script', icon: 'translate' },
              { key: 'score' as const, label: 'Score', icon: 'analytics' },
            ]).map(opt => (
              <button
                key={opt.key}
                onClick={() => setColorMode(opt.key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                  colorMode === opt.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Layer Slider ── */}
      <div className="mb-6">
        <LayerSlider
          min={0}
          max={data.num_layers - 1}
          value={layer}
          onChange={handleLayerChange}
          label="Model Layer"
          showTicks
          tickInterval={Math.max(1, Math.floor(data.num_layers / 8))}
        />
      </div>

      {/* ── PCA variance ── */}
      {pcaVariance && (
        <div className="flex gap-4 mb-4">
          {pcaVariance.map((v, i) => (
            <span key={i} className="text-[10px] font-mono text-on-surface-variant">
              PC{i + 1}: <span className="font-bold text-primary">{(v * 100).toFixed(1)}%</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter languages..."
          className="pl-10 pr-4 py-2 bg-surface-container-lowest border-none rounded-lg text-xs w-64 focus:ring-1 focus:ring-primary focus:outline-none"
        />
        {searchQuery && (
          <span className="ml-2 text-[10px] text-on-surface-variant">
            Filtering {data.languages.length} languages
          </span>
        )}
      </div>

      {/* ── Plot ── */}
      <div className="bg-surface rounded-lg border border-outline-variant/10 p-2 overflow-hidden">
        {dims === '3d' ? (
          <Scatter3D
            languages={data.languages}
            layerPoints={data.layers[String(layer)]?.points || {}}
            languageNames={languageNames}
            scores={scores}
            colorMode={colorMode}
            method={method}
            searchQuery={searchQuery}
            hoveredScript={hoveredScript}
          />
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis
                type="number" dataKey="x"
                tick={{ fontSize: 9, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                name={method === 'pca' ? 'PC1' : 'Dim 1'}
              />
              <YAxis
                type="number" dataKey="y"
                tick={{ fontSize: 9, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                name={method === 'pca' ? 'PC2' : 'Dim 2'}
              />
              <Tooltip
                content={<CustomTooltip languageNames={languageNames} scores={scores} />}
                cursor={false}
              />
              <Scatter data={scatterData2D} shape={<RenderDot />}>
                {scatterData2D.map((entry: any) => (
                  <Cell key={entry.code} opacity={entry.dimmed ? 0.15 : 0.85} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Legend ── */}
      {colorMode === 'script' && (
        <div className="mt-4 flex flex-wrap gap-2">
          {scriptLegend.slice(0, 15).map(({ script, count, color }) => (
            <button
              key={script}
              onMouseEnter={() => setHoveredScript(script)}
              onMouseLeave={() => setHoveredScript(null)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all ${
                hoveredScript === script
                  ? 'bg-primary/10 ring-1 ring-primary'
                  : 'bg-surface-container-lowest hover:bg-surface-container-high'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="tracking-wider">{script}</span>
              <span className="text-on-surface-variant font-mono">({count})</span>
            </button>
          ))}
        </div>
      )}

      {colorMode === 'score' && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Low</span>
          <div
            className="h-2.5 w-40 rounded-full"
            style={{ background: 'linear-gradient(90deg, #ae2012, #ee9b00, #0a9396, #005f73, #004655)' }}
          />
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">High</span>
        </div>
      )}
    </div>
  );
}

export default EmbeddingProjection;
