import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/wallet", label: "Wallet" },
  { to: "/transactions", label: "Transactions" },
  { to: "/settings", label: "Settings" }
];

export default function App() {
  return (
    <div className="min-h-screen bg-halo text-ma-black">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-[30px] border border-black/5 bg-white/70 p-5 shadow-card backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.35em] text-ma-gold">
              Minima AI
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ma-black">
              Full Working Base Dashboard
            </h1>
          </div>
          <nav className="flex flex-wrap gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-black bg-black text-ma-gold shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                      : "border-black/10 bg-white text-ma-black hover:border-ma-gold hover:text-ma-gold"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
