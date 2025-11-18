// import { useContext, useEffect, useRef, useState } from "react"
// import { BallManager } from "../classes/BallManager";
// import { Context, type IStoreContext } from "../store/StoreProvider";


// export function Game() {
//     const [ballManager, setBallManager] = useState<BallManager>();
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//     const { game } = useContext(Context) as IStoreContext;

//     useEffect(() => {
//         if (canvasRef.current) {
//             const ballManager = new BallManager(canvasRef.current as unknown as HTMLCanvasElement)
//             setBallManager(ballManager)
//         }

//     }, [canvasRef])

//     return (
//         <div>
//             <canvas ref={canvasRef} width="800" height="800"></canvas>
//             <button onClick={async() => {
//                 const response = await game.createGame();
//                 if (ballManager) {
//                     ballManager.addBall(response.data.point);
//                 }
//             }}>Add ball</button>
//         </div>
//     )
// }