import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import NetworkDisabled from "./components/functions/NetworkDisabled";
import CallPage from "./pages/call";
import LandingPage from "./pages/landing";
import ErrorPage from "./pages/error";
import LandscapeNotice from "./components/functions/LandscapeNotice";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "call/:callId",
        element: <CallPage />,
      },
    ],
  },
]);

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  const handleScreenOrientation = () => {
    if (
      (screen.orientation.type === "landscape-secondary" ||
        screen.orientation.type === "landscape-primary") &&
      screen.availWidth < 1024
    ) {
      setIsLandscape(true);
    } else {
      setIsLandscape(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    handleScreenOrientation();
    screen.orientation.addEventListener("change", handleScreenOrientation);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NetworkDisabled />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors duration={6000} />
      {isLandscape && <LandscapeNotice />}
    </>
  );
};

export default App;
