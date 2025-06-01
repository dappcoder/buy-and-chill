"use client";

import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  instrument: string;
  height?: number;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ instrument, height = 400 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Map our instruments to TradingView symbols
    const getSymbol = () => {
      if (instrument === "ETH/USD 2000 DMA") {
        return "ETHUSD";
      } else if (instrument === "BTC/USD 200 WMA") {
        return "BTCUSD";
      }
      return "BTCUSD"; // Default fallback
    };
    // Check if TradingView script already exists
    const existingScript = document.getElementById("tradingview-widget-script");

    // Function to initialize the widget
    const initializeWidget = () => {
      if (!containerRef.current || typeof window.TradingView === "undefined") return;

      // Clear the container
      containerRef.current.innerHTML = "";

      // Create the widget with the appropriate symbol
      const symbol = getSymbol();

      // For ETH, use a 2000-day MA, for BTC use a 200-week MA
      const interval = instrument === "ETH/USD 2000 DMA" ? "D" : "W";
      const maLength = parseInt(instrument === "ETH/USD 2000 DMA" ? "2000" : "200");

      try {
        new window.TradingView.widget({
          autosize: true,
          symbol: `BITSTAMP:${symbol}`,
          interval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerRef.current.id,
          studies_overrides: {
            // Configure the SMA appearance
            "moving average.ma.color": instrument === "ETH/USD 2000 DMA" ? "#FF9800" : "#00BCD4",
            "moving average.ma.linewidth": 3,
            "moving average.ma.transparency": 20,
            "moving average.ma.style": 0, // 0 = solid, 1 = dotted, 2 = dashed, 3 = large dashed
          },
          loading_screen: { backgroundColor: "#1E222D" },
          disabled_features: ["use_localstorage_for_settings"],
          enabled_features: ["study_templates"],
          // Add the SMA indicator directly in the studies array
          studies: [
            {
              id: "MASimple@tv-basicstudies",
              inputs: {
                length: maLength,
                source: "close",
              },
              // Override the default appearance
              outputs: {
                plot: instrument === "ETH/USD 2000 DMA" ? "#FF9800" : "#00BCD4",
              },
            },
          ],
        });
      } catch (error) {
        console.error("Error initializing TradingView widget:", error);
        // Display fallback message if widget fails
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <p class="text-base-content/60">Unable to load chart. Please try again later.</p>
            </div>
          `;
        }
      }
    };

    // If script already exists, just initialize the widget
    if (existingScript && window.TradingView) {
      initializeWidget();
      return;
    }

    // Create new script element if it doesn't exist
    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = initializeWidget;
    script.onerror = () => {
      console.error("Failed to load TradingView script");
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <p class="text-base-content/60">Unable to load chart. Please try again later.</p>
          </div>
        `;
      }
    };

    // Add script to document
    document.head.appendChild(script);

    // No need to clean up the script on unmount or instrument change
    // as we're reusing the same script for all instances
    // Store a reference to the current container element for cleanup
    const currentContainer = containerRef.current;

    return () => {
      // Just clear the container on unmount
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }
    };
  }, [instrument]);

  return (
    <div
      id={`tradingview_${instrument.replace(/[^a-zA-Z0-9]/g, "_")}`}
      ref={containerRef}
      style={{ height: `${height}px` }}
      className="w-full"
    />
  );
};

export default TradingViewChart;

// Add TradingView types
declare global {
  interface Window {
    TradingView: {
      widget: any;
    };
  }
}
