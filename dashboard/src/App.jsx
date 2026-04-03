import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import MexaFindings from './pages/MexaFindings';

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
    <footer className="w-full py-8 bg-surface flex justify-between items-center px-12 mt-auto border-t border-outline-variant/10">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <p className="text-on-secondary-container font-body text-[10px] uppercase tracking-widest">
          © 2024 Project MEXA Research Lab. High-Precision LLM Evaluation.
        </p>
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
  return (
    <BrowserRouter>
      <div className="font-body text-on-surface bg-surface min-h-screen">
        <Sidebar />

        <main className="ml-64 min-h-screen flex flex-col">
          <TopAppBar />

          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/findings" element={<MexaFindings />} />
            {/* Fallback for other sidebar items not yet implemented as separate pages */}
            <Route path="*" element={<Overview />} />
          </Routes>

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
