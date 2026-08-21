import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ThesisPurpose from './pages/ThesisPurpose';
import Overview from './pages/Overview';
import MexaFindings from './pages/MexaFindings';
import RankingValidation from './pages/RankingValidation';
import DatasetDetail from './pages/DatasetDetail';
import PivotComparison from './pages/PivotComparison';
import MarginAnalysis from './pages/MarginAnalysis';
import MoeAnalysis from './pages/MoeAnalysis';
import BadLanguages from './pages/BadLanguages';

// Llama 3.1 8B
import Llama31FloresFindings from './pages/Llama31FloresFindings';
import Llama31BibleFindings from './pages/Llama31BibleFindings';
import Llama31BibleTable1Findings from './pages/Llama31BibleTable1Findings';
import Llama31FullDatasetFindings from './pages/Llama31FullDatasetFindings';
import Llama31FloresTable1Findings from './pages/Llama31FloresTable1Findings';

// Mistral 7B v0.3
import MistralFloresFindings from './pages/MistralFloresFindings';
import MistralBibleFindings from './pages/MistralBibleFindings';
import MistralBibleTable1Findings from './pages/MistralBibleTable1Findings';
import MistralFloresTable1Findings from './pages/MistralFloresTable1Findings';

// Mixtral 8x7B
import Mixtral8x7BFloresFindings from './pages/Mixtral8x7BFloresFindings';
import Mixtral8x7BBibleFindings from './pages/Mixtral8x7BBibleFindings';
import Mixtral8x7BBibleTable1Findings from './pages/Mixtral8x7BBibleTable1Findings';
import Mixtral8x7BFloresTable1Findings from './pages/Mixtral8x7BFloresTable1Findings';
import Mixtral8x7BFloresTable1_2000Findings from './pages/Mixtral8x7BFloresTable1_2000Findings';

// Mixtral 8x22B
import Mixtral8x22BFloresTable1Findings from './pages/Mixtral8x22BFloresTable1Findings';
import Mixtral8x22BBibleTable1Findings from './pages/Mixtral8x22BBibleTable1Findings';

// Qwen3 8B Base
import Qwen3FloresFindings from './pages/Qwen3FloresFindings';
import Qwen3BibleFindings from './pages/Qwen3BibleFindings';
import Qwen3FloresTable1Findings from './pages/Qwen3FloresTable1Findings';
import Qwen3BibleTable1Findings from './pages/Qwen3BibleTable1Findings';
import Qwen3FloresTable1_2000Findings from './pages/Qwen3FloresTable1_2000Findings';

// Qwen3 4B
import Qwen34BFloresFindings from './pages/Qwen34BFloresFindings';
import Qwen34BBibleFindings from './pages/Qwen34BBibleFindings';
import Qwen34BFloresTable1Findings from './pages/Qwen34BFloresTable1Findings';
import Qwen34BBibleTable1Findings from './pages/Qwen34BBibleTable1Findings';

// Qwen3 1.7B
import Qwen317BFloresFindings from './pages/Qwen317BFloresFindings';
import Qwen317BBibleFindings from './pages/Qwen317BBibleFindings';
import Qwen317BFloresTable1Findings from './pages/Qwen317BFloresTable1Findings';
import Qwen317BBibleTable1Findings from './pages/Qwen317BBibleTable1Findings';

// Qwen3 0.6B
import Qwen306BFloresFindings from './pages/Qwen306BFloresFindings';
import Qwen306BBibleFindings from './pages/Qwen306BBibleFindings';
import Qwen306BFloresTable1Findings from './pages/Qwen306BFloresTable1Findings';
import Qwen306BBibleTable1Findings from './pages/Qwen306BBibleTable1Findings';

// Qwen3.5 9B Base
import Qwen35FloresFindings from './pages/Qwen35FloresFindings';
import Qwen35BibleFindings from './pages/Qwen35BibleFindings';
import Qwen35FloresTable1Findings from './pages/Qwen35FloresTable1Findings';
import Qwen35BibleTable1Findings from './pages/Qwen35BibleTable1Findings';
import Qwen35FloresTable1_2000Findings from './pages/Qwen35FloresTable1_2000Findings';

// Apertus 8B
import ApertusFloresFindings from './pages/ApertusFloresFindings';
import ApertusBibleFindings from './pages/ApertusBibleFindings';
import ApertusFloresTable1_2000Findings from './pages/ApertusFloresTable1_2000Findings';

// Apertus 4B (v1.1)
import ApertusMini4BFloresFindings from './pages/ApertusMini4BFloresFindings';
import ApertusMini4BBibleFindings from './pages/ApertusMini4BBibleFindings';
import ApertusMini4BFloresTable1Findings from './pages/ApertusMini4BFloresTable1Findings';
import ApertusMini4BFloresTable1_2000Findings from './pages/ApertusMini4BFloresTable1_2000Findings';
import ApertusMini4BBibleTable1Findings from './pages/ApertusMini4BBibleTable1Findings';

// Restyled Analysis Components
import ModelComparison from './components/ModelComparison';
import ScoreRanking from './components/ScoreRanking';
import Heatmap from './components/Heatmap';

/* ── Data Helpers (extracted from Overview) ── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const models = headers.slice(1);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row = { code: cols[0] };
    for (let j = 1; j < cols.length; j++) {
      row[models[j - 1]] = cols[j];
    }
    data.push(row);
  }
  return { models, data };
}

/* ── Top App Bar ── */
function TopAppBar() {
  return (
    <header className="w-full sticky top-0 bg-surface/90 backdrop-blur-md z-40 flex justify-between items-center px-8 md:px-12 h-16 border-b border-outline-variant/15">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[11px] font-headline font-bold uppercase tracking-wider">
            TUM CIT
          </span>
          <span className="text-sm font-headline font-bold text-on-surface hidden sm:inline">
            Evaluating Multilingual LLMs with Cross-Lingual Alignment
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NavLink
          to="/thesis-purpose"
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`
          }
        >
          <span className="material-symbols-outlined text-sm">school</span>
          <span>Thesis Purpose</span>
        </NavLink>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`
          }
        >
          <span className="material-symbols-outlined text-sm">dashboard</span>
          <span>Overview Dashboard</span>
        </NavLink>

        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-outline-variant/20 text-[11px] text-on-surface-variant/70">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CIT-TUM-HN Cluster</span>
        </div>
      </div>
    </header>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="w-full py-6 bg-surface flex flex-col md:flex-row justify-between items-center gap-4 px-8 md:px-12 mt-auto border-t border-outline-variant/15 text-on-surface-variant/70 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary" />
        <p className="font-body text-[11px]">
          <strong className="text-on-surface font-semibold">TUM CIT B.Sc. Thesis</strong> · Evaluating Multilingual LLM Performance with Cross-Lingual Alignment
        </p>
      </div>
      <div className="text-[10px] text-center max-w-xl text-on-surface-variant/60">
        Supervised by Prof. Dr. Alexander Fraser & Shu Okabe · Technical University of Munich · CIT-TUM-HN Cluster
      </div>
      <div className="flex gap-4 text-[11px]">
        <NavLink to="/thesis-purpose" className="hover:text-primary transition-colors">
          Thesis Purpose
        </NavLink>
        <NavLink to="/datasets/flores" className="hover:text-primary transition-colors">
          FLORES-200
        </NavLink>
        <NavLink to="/datasets/bible" className="hover:text-primary transition-colors">
          Bible (sPBC)
        </NavLink>
      </div>
    </footer>
  );
}

/* ── Main App ── */
function App() {
  const [languageNames, setLanguageNames] = useState({});
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [langNamesRes, fmb, fma, bmb, bma] = await Promise.all([
          fetch('/data/language_names.json').then((r) => r.json()),
          fetch('/data/flores-max-belebele.csv').then((r) => r.text()),
          fetch('/data/flores-mean-arc.csv').then((r) => r.text()),
          fetch('/data/bible-max-belebele.csv').then((r) => r.text()),
          fetch('/data/bible-mean-arc.csv').then((r) => r.text()),
        ]);

        const floresNameMap = {};
        const allCsvTexts = [fmb, fma, bmb, bma].filter(Boolean);
        const allFloresCodes = new Set();
        allCsvTexts.forEach((csv) => {
          csv.trim().split('\n').slice(1).forEach((line) => {
            const code = line.split(',')[0];
            if (code) allFloresCodes.add(code);
          });
        });
        allFloresCodes.forEach((floresCode) => {
          const isoCode = floresCode.split('_')[0];
          const baseName = langNamesRes[isoCode];
          floresNameMap[floresCode] = baseName || floresCode;
        });

        setLanguageNames(floresNameMap);
        setAllData({
          'flores-max': parseCSV(fmb),
          'flores-mean': parseCSV(fma),
          'bible-max': parseCSV(bmb),
          'bible-mean': parseCSV(bma),
        });
      } catch (err) {
        console.error('Failed to load data:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const defaultDataObj = allData['flores-max'] || { models: [], data: [] };

  return (
    <BrowserRouter>
      <div className="font-body text-on-surface bg-surface min-h-screen">
        <Sidebar />

        <main className="ml-80 min-h-screen flex flex-col">
          <TopAppBar />

          <div className="flex-1 p-12">
            {!loading ? (
              <Routes>
                {/* General */}
                <Route path="/thesis-purpose" element={<ThesisPurpose />} />
                <Route path="/" element={<Overview />} />
                <Route path="/findings" element={<MexaFindings />} />
                <Route path="/validation" element={<RankingValidation />} />
                <Route path="/bad-languages" element={<BadLanguages />} />

                {/* Dataset references */}
                <Route path="/datasets/flores" element={<DatasetDetail dataset="flores" />} />
                <Route path="/datasets/bible" element={<DatasetDetail dataset="bible" />} />

                {/* Llama 3.1 8B */}
                <Route path="/llama31/flores" element={<Llama31FloresFindings />} />
                <Route path="/llama31/bible" element={<Llama31BibleFindings />} />
                <Route path="/llama31/bible-table1" element={<Llama31BibleTable1Findings />} />
                <Route path="/llama31/full-dataset" element={<Llama31FullDatasetFindings />} />
          <Route path="/llama31/flores-table1" element={<Llama31FloresTable1Findings />} />

                {/* Mistral 7B v0.3 */}
                <Route path="/mistral/flores" element={<MistralFloresFindings />} />
                <Route path="/mistral/bible" element={<MistralBibleFindings />} />
                <Route path="/mistral/bible-table1" element={<MistralBibleTable1Findings />} />
                <Route path="/mistral/flores-table1" element={<MistralFloresTable1Findings />} />

                {/* Mixtral 8x7B */}
                <Route path="/mixtral/flores" element={<Mixtral8x7BFloresFindings />} />
                <Route path="/mixtral/bible" element={<Mixtral8x7BBibleFindings />} />
                <Route path="/mixtral/bible-table1" element={<Mixtral8x7BBibleTable1Findings />} />
                <Route path="/mixtral/flores-table1-100" element={<Mixtral8x7BFloresTable1Findings />} />
                <Route path="/mixtral/flores-table1-2000" element={<Mixtral8x7BFloresTable1_2000Findings />} />

                {/* Mixtral 8x22B */}
                <Route path="/mixtral-8x22b/flores-table1-100" element={<Mixtral8x22BFloresTable1Findings />} />
                <Route path="/mixtral-8x22b/bible-table1" element={<Mixtral8x22BBibleTable1Findings />} />

                {/* Qwen3 8B Base */}
                <Route path="/qwen3/flores" element={<Qwen3FloresFindings />} />
                <Route path="/qwen3/bible" element={<Qwen3BibleFindings />} />
                <Route path="/qwen3/flores-table1" element={<Qwen3FloresTable1Findings />} />
                <Route path="/qwen3/flores-table1-2000" element={<Qwen3FloresTable1_2000Findings />} />
                <Route path="/qwen3/bible-table1" element={<Qwen3BibleTable1Findings />} />

                {/* Qwen3 4B */}
                <Route path="/qwen3-4b/flores" element={<Qwen34BFloresFindings />} />
                <Route path="/qwen3-4b/bible" element={<Qwen34BBibleFindings />} />
                <Route path="/qwen3-4b/flores-table1" element={<Qwen34BFloresTable1Findings />} />
                <Route path="/qwen3-4b/bible-table1" element={<Qwen34BBibleTable1Findings />} />

                {/* Qwen3 1.7B */}
                <Route path="/qwen3-1.7b/flores" element={<Qwen317BFloresFindings />} />
                <Route path="/qwen3-1.7b/bible" element={<Qwen317BBibleFindings />} />
                <Route path="/qwen3-1.7b/flores-table1" element={<Qwen317BFloresTable1Findings />} />
                <Route path="/qwen3-1.7b/bible-table1" element={<Qwen317BBibleTable1Findings />} />

                {/* Qwen3 0.6B */}
                <Route path="/qwen3-0.6b/flores" element={<Qwen306BFloresFindings />} />
                <Route path="/qwen3-0.6b/bible" element={<Qwen306BBibleFindings />} />
                <Route path="/qwen3-0.6b/flores-table1" element={<Qwen306BFloresTable1Findings />} />
                <Route path="/qwen3-0.6b/bible-table1" element={<Qwen306BBibleTable1Findings />} />

                {/* Qwen3.5 9B Base */}
                <Route path="/qwen3.5/flores" element={<Qwen35FloresFindings />} />
                <Route path="/qwen3.5/bible" element={<Qwen35BibleFindings />} />
                <Route path="/qwen3.5/flores-table1" element={<Qwen35FloresTable1Findings />} />
                <Route path="/qwen3.5/flores-table1-2000" element={<Qwen35FloresTable1_2000Findings />} />
                <Route path="/qwen3.5/bible-table1" element={<Qwen35BibleTable1Findings />} />

                {/* Apertus 8B */}
                <Route path="/apertus/flores" element={<ApertusFloresFindings />} />
                <Route path="/apertus/bible" element={<ApertusBibleFindings />} />
                <Route path="/apertus/flores-table1-2000" element={<ApertusFloresTable1_2000Findings />} />

                {/* Apertus 4B (v1.1) */}
                <Route path="/apertus-4b/flores" element={<ApertusMini4BFloresFindings />} />
                <Route path="/apertus-4b/bible" element={<ApertusMini4BBibleFindings />} />
                <Route path="/apertus-4b/flores-table1" element={<ApertusMini4BFloresTable1Findings />} />
                <Route path="/apertus-4b/flores-table1-2000" element={<ApertusMini4BFloresTable1_2000Findings />} />
                <Route path="/apertus-4b/bible-table1" element={<ApertusMini4BBibleTable1Findings />} />

                {/* Analysis Tools */}
                <Route 
                  path="/alignment" 
                  element={<Heatmap data={defaultDataObj.data} models={defaultDataObj.models} languageNames={languageNames} />} 
                />
                <Route 
                  path="/distribution" 
                  element={<ScoreRanking data={defaultDataObj.data} models={defaultDataObj.models} languageNames={languageNames} />} 
                />
                <Route 
                  path="/comparison" 
                  element={<ModelComparison data={defaultDataObj.data} models={defaultDataObj.models} languageNames={languageNames} />} 
                />
                <Route
                  path="/pivot-comparison"
                  element={<PivotComparison />}
                />
                <Route
                  path="/margin-analysis"
                  element={<MarginAnalysis />}
                />
                <Route
                  path="/moe-analysis"
                  element={<MoeAnalysis />}
                />

                {/* Legacy redirects */}
                <Route path="/my-findings" element={<Navigate to="/llama31/flores" replace />} />
                <Route path="/llama31-table1" element={<Navigate to="/llama31/full-dataset" replace />} />
                <Route path="/mistral-findings" element={<Navigate to="/mistral/flores" replace />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : (
              <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-on-surface-variant/40">
                <span className="icon text-4xl animate-spin">refresh</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Hydrating Scholarly Ledger...</span>
              </div>
            )}
          </div>

          <Footer />
        </main>

        {/* FAB */}
        <button className="fixed bottom-10 right-10 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group z-50">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            add
          </span>
          <span className="absolute right-16 bg-inverse-surface text-inverse-on-surface text-[10px] px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-widest font-bold">
            New Thesis Experiment
          </span>
        </button>
      </div>
    </BrowserRouter>
  );
}

export default App;
