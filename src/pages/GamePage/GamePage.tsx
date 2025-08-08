import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BallManager } from "../../classes/BallManager";
import { Button } from "../../components/ui/Button";
import { Context, type IStoreContext } from "../../store/StoreProvider";
import { MAIN_ROUTE } from "../../utils/consts";

export function GamePage() {
  const [ballManager, setBallManager] = useState<BallManager>();
  const [lastBetResult, setLastBetResult] = useState<any>(null);
  const [selectedBetAmount, setSelectedBetAmount] = useState<number>(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { game, user } = useContext(Context) as IStoreContext;
  const navigate = useNavigate();

  // Доступные размеры ставок
  const betAmounts = [10, 25, 50, 100, 250, 500, 1000];

  useEffect(() => {
    if (canvasRef.current) {
      const ballManager = new BallManager(
        canvasRef.current as unknown as HTMLCanvasElement,
        (sinkIndex: number, startX?: number) => {
          console.log(`Ball landed in sink ${sinkIndex} from position ${startX}`);
        }
      );
      setBallManager(ballManager);
    }
  }, [canvasRef]);

  // Проверяем, есть ли активная игра
  useEffect(() => {
    if (!game.currentGame) {
      navigate(MAIN_ROUTE);
    }
  }, [game.currentGame, navigate]);

  const handlePlaceBet = async () => {
    if (ballManager && game.currentGame) {
      try {
        const response = await game.placeBet(game.currentGame.id, selectedBetAmount);
        setLastBetResult(response.betResult);
        // Запускаем шарик с позиции, полученной с сервера
        ballManager.addBall(response.betResult.ballStartPosition);
        console.log(`Multiplier: ${response.betResult.multiplier}x, Win: ${response.betResult.winAmount}`);
      } catch (error) {
        console.error("Error placing bet:", error);
      }
    }
  };

  const handleBackToLobby = () => {
    game.clearCurrentGame();
    navigate(MAIN_ROUTE);
  };

  // Получаем баланс пользователя
  const userBalance = user.user?.balance || 0;

  if (!game.currentGame) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No active game found</p>
          <button
            onClick={handleBackToLobby}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-4">
      <div className="flex flex-col items-center">
        <canvas ref={canvasRef} width="800" height="800"></canvas>
        
        
        
      </div>

      {/* Панель выбора ставки */}
      <div className="p-4 rounded-lg shadow-lg min-w-[400px] border border-gray-200">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Select Bet Amount</h3>
      </div>
      
      {/* Кнопки выбора ставки */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {betAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedBetAmount(amount)}
            disabled={amount > userBalance}
            className={`p-3 rounded-lg font-semibold transition-all duration-200 ${
              selectedBetAmount === amount
                ? 'bg-blue-500 text-white'
                : amount > userBalance
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {amount}
          </button>
        ))}
      </div>
      
      {/* Кнопки действий */}
      <div className="flex gap-4 justify-center">
        <Button
          className="text-white text-sm"
          onClick={handlePlaceBet}
          // disabled={game.betLoading || selectedBetAmount > userBalance}
        >
          {game.betLoading ? "Placing Bet..." : `Place Bet (${selectedBetAmount})`}
        </Button>
        <button
          onClick={handleBackToLobby}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
        >
          Back to Lobby
        </button>
      </div>
      
      {/* Предупреждение о недостаточном балансе */}
      {selectedBetAmount > userBalance && (
        <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
          <p className="text-red-700 text-sm text-center">
            Insufficient balance for this bet
          </p>
        </div>
      )}
      
      {/* Панель результатов */}
      <div className="flex flex-col items-center p-6 rounded-lg min-w-[300px]">
        <h3 className="text-xl font-bold mb-4">Game Results</h3>
        
        {lastBetResult ? (
          <div className="space-y-3 text-center grid grid-cols-2 gap-4">
            <div className="p-3 rounded border border-gray-300">
              <div className="text-sm text-gray-600">Bet Amount</div>
              <div className="text-lg font-semibold">{lastBetResult.betAmount}</div>
            </div>
            
            <div className="p-3 rounded border border-gray-300">
              <div className="text-sm text-gray-600">Multiplier</div>
              <div className="text-lg font-semibold text-[#4cc9f0]">
                {lastBetResult.multiplier}x
              </div>
            </div>
            
            <div className="p-3 rounded border border-gray-300">
              <div className="text-sm text-gray-600">Win Amount</div>
              <div className="text-xl font-bold text-[#b5179e]">
                {lastBetResult.winAmount}
              </div>
            </div>
            
            <div className="p-3 rounded border border-gray-300">
              <div className="text-sm text-gray-600">Balance</div>
              <div className="text-lg font-semibold">{lastBetResult.newBalance}</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">
            Place a bet to see results
          </div>
        )}

        {/* Ошибки */}
        {game.isServerError && (
          <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
            <p className="text-red-700 text-sm">
              {game.serverErrorMessage || "Server error occurred"}
            </p>
          </div>
        )}

        {game.isTooManyRequests && (
          <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              Too many requests. Please try again later.
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}