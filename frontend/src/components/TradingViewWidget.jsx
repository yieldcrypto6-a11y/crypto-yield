import React, { useEffect, useRef } from "react";

/**
 * Embeds TradingView's public widget for a given symbol.
 * Docs: https://www.tradingview.com/widget/advanced-chart/
 */
export default function TradingViewWidget({ symbol = "BINANCE:BTCUSDT", theme = "dark", height = 480 }) {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      backgroundColor: "rgba(10,14,24,1)",
      gridColor: "rgba(34,232,255,0.06)",
      support_host: "https://www.tradingview.com"
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.height = "100%";
    wrapper.style.width = "100%";
    wrapper.appendChild(widgetDiv);
    wrapper.appendChild(script);

    container.current.appendChild(wrapper);
  }, [symbol, theme]);

  return (
    <div
      ref={container}
      style={{ height }}
      className="w-full rounded-xl overflow-hidden border border-line"
    />
  );
}
