import { useContext, useEffect, useState, lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Context, type IStoreContext } from "./store/StoreProvider";
import "./App.css";
import LoadingIndicator from "./components/ui/LoadingIndicator";
import ErrorPage from "./pages/ErrorPage/ErrorPage";
import type { TelegramWebApp } from "./types/types";

// Lazy-loaded Components

const AppRouter = lazy(() => import("./AppRouter"));


const App = observer(() => {
  const { user } = useContext(Context) as IStoreContext;
  const [loading, setLoading] = useState(true);

  const tg = (window as any).Telegram?.WebApp as TelegramWebApp;
  console.log(tg);


  useEffect(() => {
    const authenticate = async () => {
      const initData = tg?.initData;

      if (initData) {
        try {
          await user.telegramLogin(initData.toString());
        } catch (error) {
          console.error("Telegram authentication error:", error);
        }
      } else {
        try {
          await user.checkAuth();
        } catch (error) {
          console.error("Check authentication error:", error);
        }
      }
      setLoading(false);
    };

    authenticate();
  }, [user]);


  if (loading) {
    return (
      <div className="loading">
        <LoadingIndicator />
      </div>
    );
  }

  if (user.isServerError) {
    return (
      <ErrorPage 
        title="Server connection error" 
        message={user.serverErrorMessage || "Server is not responding. Please try again later."} 
      />
    );
  }

  if (user.isTooManyRequests) {
    return (
      <ErrorPage 
        title="Too many requests" 
        message="Please try again later." 
      />
    );
  }

  return (
    // <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
      <BrowserRouter>
        
      
      {/* <Suspense
        fallback={
          <LoadingIndicator />
        }
      > */}
        <AppRouter />
      {/* </Suspense> */}
      
    </BrowserRouter>
    // </TonConnectUIProvider>
  );
});

export default App;
