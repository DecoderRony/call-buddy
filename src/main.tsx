import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";





createRoot(document.getElementById("root")!).render(
  <div id="app-container" className="h-dvh">
    <App />
  </div>
);
