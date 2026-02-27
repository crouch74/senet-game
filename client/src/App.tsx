import { Board } from './components/Board';
import { HUD } from './components/HUD';
import { ThrowSticks } from './components/ThrowSticks';
import { useSenetStore } from './engine/store';

function App() {
  const { historyLog } = useSenetStore();

  return (
    <div className="min-h-screen bg-ebony text-sand flex flex-col font-sans selection:bg-gold/30">
      {/* Background thematic elements */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sand via-ebony to-ebony" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col relative z-10">
        <HUD />

        <div className="flex-1 flex flex-col xl:flex-row gap-8 items-center justify-center">
          {/* Main Game Area */}
          <div className="flex-1 w-full flex flex-col items-center justify-center order-2 xl:order-1">
            <Board />
            <ThrowSticks />
          </div>

          {/* Side Panel: History & Rules Info */}
          <div className="w-full xl:w-96 flex flex-col h-full gap-4 order-1 xl:order-2 shrink-0">
            <div className="bg-black/40 border border-sand/20 rounded-lg p-4 flex-1 overflow-hidden flex flex-col h-64 xl:h-auto">
              <h2 className="text-gold font-serif text-lg border-b border-sand/20 pb-2 mb-2 uppercase tracking-wide">
                Chronicle
              </h2>
              <div className="overflow-y-auto flex-1 flex flex-col gap-2 text-sm pr-2 custom-scrollbar">
                {historyLog.slice().reverse().map((log, i) => (
                  <div key={i} className="text-sand/80 font-mono flex gap-2 border-b border-sand/5 pb-1">
                    <span className="opacity-50 text-xs mt-0.5">{(historyLog.length - i).toString().padStart(3, '0')}</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-ochre/10 border border-ochre/30 rounded-lg p-4 text-sm">
              <h3 className="text-ochre font-bold mb-2 flex items-center gap-2">
                <span>📜</span> Historical Note
              </h3>
              <p className="text-sand/80 mb-2 text-xs leading-relaxed">
                Senet is one of the oldest known board games, dating back to c. 3100 BC.
                The exact rules are lost to time, but have been reconstructed by historians like Timothy Kendall and Edgar Pusch.
              </p>
              <p className="text-sand/80 text-xs leading-relaxed">
                The board represents the journey to the afterlife, with squares 26-30 depicting the judgment of the soul by the gods.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
