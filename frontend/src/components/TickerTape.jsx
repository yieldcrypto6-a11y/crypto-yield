import React, { useEffect, useRef } from "react";

const DEFAULT_SYMBOLS = [
  { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" },
  { proName: "BITSTAMP:ETHUSD", title: "ETH/USD" },
  { proName: "OANDA:XAUUSD", title: "Gold" },
  { proName: "NASDAQ:AAPL", title: "Apple" },
  { proName: "NASDAQ:TSLA", title: "Tesla" },
  { proName: "NASDAQ:NVDA", title: "NVIDIA" }
];

export default function TickerTape({ symbols = DEFAULT_SYMBOLS }) {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en"
    });
    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.appendChild(script);
    container.current.appendChild(wrapper);
  }, [symbols]);

  return <div ref={container} className="w-full border-y border-line/70 bg-surface/40" />;
}
