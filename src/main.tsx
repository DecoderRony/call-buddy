import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/functions/Error-Boundary";

createRoot(document.getElementById("root")!).render(
  <div id="app-container" className="h-dvh">
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </div>
);
