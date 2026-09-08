import React, { useState } from "react";
import { FiTrendingUp } from "react-icons/fi";
import TradingViewWidget from "../../components/TradingViewWidget";
import TickerTape from "../../components/TickerTape";

const MARKETS = {
  Crypto: [
    { label: "Bitcoin (BTC/USDT)", symbol: "BINANCE:BTCUSDT" },
    { label: "Ethereum (ETH/USDT)", symbol: "BINANCE:ETHUSDT" },
    { label: "BNB (BNB/USDT)", symbol: "BINANCE:BNBUSDT" },
    { label: "Solana (SOL/USDT)", symbol: "BINANCE:SOLUSDT" }
  ],
  Forex: [
    { label: "Gold (XAU/USD)", symbol: "OANDA:XAUUSD" },
    { label: "EUR/USD", symbol: "OANDA:EURUSD" },
    { label: "GBP/USD", symbol: "OANDA:GBPUSD" },
    { label: "Silver (XAG/USD)", symbol: "OANDA:XAGUSD" }
  ],
  Stocks: [
    { label: "Tesla (TSLA)", symbol: "NASDAQ:TSLA" },
    { label: "Apple (AAPL)", symbol: "NASDAQ:AAPL" },
    { label: "NVIDIA (NVDA)", symbol: "NASDAQ:NVDA" },
    { label: "Microsoft (MSFT)", symbol: "NASDAQ:MSFT" }
  ]
};

export default function Markets() {
  const [category, setCategory] = useState("Crypto");
  const [symbol, setSymbol] = useState(MARKETS.Crypto[0].symbol);

  const switchCategory = (cat) => {
    setCategory(cat);
    setSymbol(MARKETS[cat][0].symbol);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">Markets</h1>
        <p className="text-slate-400 text-sm mt-1">Live professional charts for crypto, forex/metals and top stocks.</p>
      </div>

      <div className="neon-border neon-border-cyan rounded-xl overflow-hidden">
        <TickerTape />
      </div>

      <div className="flex gap-2">
        {Object.keys(MARKETS).map((cat) => (
          <button
            key={cat} onClick={() => switchCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === cat ? "btn-primary text-white" : "border border-line text-slate-400 hover:text-white"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 space-y-2">
          {MARKETS[category].map((m) => (
            <button
              key={m.symbol} onClick={() => setSymbol(m.symbol)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-colors ${
                symbol === m.symbol
                  ? "neon-border neon-border-violet bg-white/5 text-white"
                  : "border border-line text-slate-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              <FiTrendingUp size={15} className="shrink-0" /> {m.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 neon-border neon-border-violet rounded-2xl p-2 bg-white/[0.02]">
          <TradingViewWidget symbol={symbol} height={520} />
        </div>
      </div>
    </div>
  );
}
