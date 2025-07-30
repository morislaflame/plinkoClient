import { useContext, useEffect, useRef, useState } from "react";
import { BallManager } from "../../classes/BallManager";
import { Button } from "../../components/ui/Button";
import { makeBet } from "../../http/gameAPI";
import { Context, type IStoreContext } from "../../store/StoreProvider";

export function GamePage() {
  const [ballManager, setBallManager] = useState<BallManager>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { game } = useContext(Context) as IStoreContext;

  useEffect(() => {
    if (canvasRef.current) {
      const ballManager = new BallManager(
        canvasRef.current as unknown as HTMLCanvasElement
      );
      setBallManager(ballManager);
    }
  }, [canvasRef]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center">
      <canvas ref={canvasRef} width="800" height="800"></canvas>
      <Button
        className="px-10 mb-4"
        onClick={async () => {
          // const response = await game.createGame();
          if (ballManager) {
            ballManager.addBall(3983905.6701957127);
          }
        }}
      >
        Add ball
      </Button>
    </div>
  );
}