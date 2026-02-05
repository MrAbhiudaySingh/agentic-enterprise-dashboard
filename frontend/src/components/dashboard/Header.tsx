import { Terminal, Activity } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Agentic Enterprise
              </h1>
              <p className="text-xs text-slate-400">CEO-Driven Multi-Agent Operating Model</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-300">System Active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
