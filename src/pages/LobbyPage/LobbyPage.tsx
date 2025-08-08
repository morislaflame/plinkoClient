import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Context, type IStoreContext } from "../../store/StoreProvider";
import { GAME_ROUTE, LOGIN_ROUTE, WIDTH } from "../../utils/consts";
import { BallManager } from "../../classes/BallManager";
import { pad } from "../../utils/padding";

const LobbyPage = observer(() => {
  const { game, user } = useContext(Context) as IStoreContext;
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleStartNewGame = async () => {
    // Проверяем авторизацию пользователя
    if (!user.isAuth) {
      navigate(LOGIN_ROUTE);
      return;
    }

    try {
      setIsCreating(true);
      await game.createGame();
      navigate(GAME_ROUTE);
    } catch (error) {
      console.error("Error creating game:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoToLogin = () => {
    navigate(LOGIN_ROUTE);
  };

  async function simulate(ballManager: BallManager) {
    let i = 0;
    while (1) {
      i++;
      ballManager.addBall(pad(WIDTH / 2 + 20 * (Math.random() - 0.5)));
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  useEffect(() => {
    if (canvasRef.current) {
      const ballManager = new BallManager(
        canvasRef.current as unknown as HTMLCanvasElement,
        // (index: number, startX?: number) => {
        //   setOutputs((outputs: any) => {
        //     return {
        //       ...outputs,
        //       [index]: [...(outputs[index] as number[]), startX],
        //     };
        //   });
        // }
      );
      simulate(ballManager);

      return () => {
        ballManager.stop();
      };
    }
  }, [canvasRef]);

  return (
    <div className="flex items-center justify-center min-h-screen ">


      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Plinko Game
        </h1>
        
        <div className="space-y-6">
          {/* Информация о пользователе */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Welcome to Plinko!</h2>
            <p className="text-gray-600">
              Drop the ball and watch it bounce through the pegs to win prizes!
            </p>
          </div>

          {/* Статус авторизации */}
          {!user.isAuth && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm text-center">
                You need to be logged in to play the game
              </p>
            </div>
          )}

          {/* Кнопка начала игры */}
          <div className="text-center">
            <button
              onClick={handleStartNewGame}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating Game..." : "Start New Game"}
            </button>
          </div>

          {/* Кнопка перехода на логин */}
          <div className="text-center">
            <button
              onClick={handleGoToLogin}
              className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-all duration-200"
            >
              {user.isAuth ? "Switch Account" : "Login to Play"}
            </button>
          </div>


          {/* Информация о пользователе (если авторизован) */}
          {user.isAuth && user.user && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Your Account:</h3>
              <div className="text-sm text-green-700">
                <p>Email: {user.user.email}</p>
                <p>Balance: {user.user.balance || 0}</p>
              </div>
            </div>
          )}

          {/* Статистика (если есть активная игра) */}
          {game.currentGame && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Current Game:</h3>
              <div className="text-sm text-blue-700">
                <p>Game ID: {game.currentGame.id}</p>
                <p>Total Bet: {game.currentGameTotalBet}</p>
                <p>Total Win: {game.currentGameTotalWin}</p>
              </div>
            </div>
          )}

          {/* Ошибки */}
          {game.isServerError && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-700 text-sm">
                {game.serverErrorMessage || "Server error occurred"}
              </p>
            </div>
          )}

          {game.isTooManyRequests && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Too many requests. Please try again later.
              </p>
            </div>
          )}

          {user.isServerError && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-red-700 text-sm">
                {user.serverErrorMessage || "User server error occurred"}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <canvas ref={canvasRef} width="800" height="800"></canvas>
      </div>
    </div>
  );
});

export default LobbyPage;