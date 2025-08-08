import { useContext, useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LOGIN_ROUTE,
  REGISTER_ROUTE,
  MAIN_ROUTE,
} from "../../utils/consts";
import { registration, login } from "../../http/userAPI";
import { observer } from "mobx-react-lite";
import { Context, type IStoreContext } from "../../store/StoreProvider";
import type { UserInfo } from "../../types/types";

const Auth = observer(() => {
  const { user } = useContext(Context) as IStoreContext;
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === LOGIN_ROUTE;
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await login(email, password);
      } else {
        data = await registration(email, password);
      }
      user.setUser(data as UserInfo);
      user.setIsAuth(true);

      localStorage.setItem("redirectAfterReload", MAIN_ROUTE);
      window.location.reload();
    } catch (error) {
      if (error instanceof Error && error.message.includes("propagatable")) {
        throw error;
      }
      console.error("Error during registration or login:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const redirectAfterReload = localStorage.getItem("redirectAfterReload");
    if (redirectAfterReload) {
      localStorage.removeItem("redirectAfterReload");
      navigate(redirectAfterReload);
    }
  }, [navigate]);

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='flex flex-col items-center justify-center gap-4'>
        <h2 className='text-2xl font-bold'>
          {isLogin ? "Authorization" : "Registration"}
        </h2>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <input
              type="email"
              className="border border-gray-300 p-2 rounded-md"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <input
              type="password"
              className="border border-gray-300 p-2 rounded-md"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-2">
            {isLogin ? (
              <p className="text-sm text-gray-200">
                No account? <NavLink to={REGISTER_ROUTE}>Sign up</NavLink>
              </p>
            ) : (
              <>
                Have an account? <NavLink to={LOGIN_ROUTE}>Sign in</NavLink>
              </>
            )}
          </div>
          <div className="flex flex-col items-center justify-center">
            <button
              className="bg-blue-500 text-white p-2 rounded-md"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Loading..." : (isLogin ? "Sign in" : "Sign up")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Auth;
