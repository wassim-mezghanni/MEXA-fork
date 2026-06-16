import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import MexaFindings from './pages/MexaFindings';
import RankingValidation from './pages/RankingValidation';
import DatasetDetail from './pages/DatasetDetail';

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
    <header className="w-full sticky top-0 bg-surface z-40 flex justify-between items-center px-12 h-16">
      <div className="flex items-center gap-8">
        <span className="text-xl font-headline font-bold tracking-tighter text-primary">
          The Scholarly Lens
        </span>
        <nav className="hidden md:flex items-center gap-6">
          {['Analysis', 'Models', 'Datasets', 'Reports'].map((item, i) => (
            <a
              key={item}
              href="#"
              className={`font-headline tracking-tight font-semibold text-sm transition-colors ${
                i === 0
                  ? 'text-primary border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search experiments..."
            className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-xs w-64 focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
          notifications
        </button>
        <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
          settings
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 bg-primary-container flex items-center justify-center">
          <span className="text-white text-xs font-bold">W</span>
        </div>
      </div>
    </header>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="w-full py-8 bg-surface flex flex-col md:flex-row justify-between items-center gap-4 px-12 mt-auto border-t border-outline-variant/10">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <p className="text-on-secondary-container font-body text-[10px] uppercase tracking-widest">
          © 2024 Project MEXA Research Lab. High-Precision LLM Evaluation.
        </p>
      </div>
      <div className="text-on-secondary-container/60 font-body text-[9px] uppercase tracking-wider text-center max-w-xl">
        Experiments presented in this work were carried out using the CIT-TUM-HN cluster at TUM Campus Heilbronn.
      </div>
      <div className="flex gap-8">
        {['Methodology', 'Whitepaper', 'Ethics Statement'].map((link) => (
          <a
            key={link}
            href="#"
            className="text-on-secondary-container hover:text-primary font-body text-[10px] uppercase tracking-widest transition-colors"
          >
            {link}
          </a>
        ))}
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

        <main className="ml-64 min-h-screen flex flex-col">
          <TopAppBar />

          <div className="flex-1 p-12">
            {!loading ? (
              <Routes>
                {/* General */}
                <Route path="/" element={<Overview />} />
                <Route path="/findings" element={<MexaFindings />} />
                <Route path="/validation" element={<RankingValidation />} />

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
