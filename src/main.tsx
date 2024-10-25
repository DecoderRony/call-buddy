import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import CallPage from "./pages/call";
import LandingPage from "./pages/landing";
import { Toaster } from "./components/ui/sonner";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/call/:callId",
    element: <CallPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <div id="app-container" className="h-dvh">
    <RouterProvider router={router} />
    <Toaster position="top-right" richColors duration={6000} />
  </div>
);
