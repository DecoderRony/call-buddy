import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import NetworkDisabled from "./components/ui/NetworkDisabled";
import CallPage from "./pages/call";
import Landing from "./pages/landing";

const router = createBrowserRouter([
  {

    path: '/',
    element: <Landing />
  },
  {
    path: "/call/:callId",
    element: <CallPage />,
  },
]);

const App = () => {
  // state to track network connection availability
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return <>
    {isOnline ?
      <>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors duration={6000} />
      </>
      :
      <NetworkDisabled />
    }
  </>
}

export default App;