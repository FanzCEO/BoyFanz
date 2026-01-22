import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPerformanceMonitoring } from "./lib/performance";

// F2-F3: Initialize Performance Monitoring (Core Web Vitals + Error Tracking)
initPerformanceMonitoring();

createRoot(document.getElementById("root")!).render(<App />);
