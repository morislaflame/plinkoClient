// src/routes.ts (если у вас массив роутов)
import MenuPage from './pages/MenuPage/MenuPage';
import { GamePage } from './pages/GamePage/GamePage';
import { MAIN_ROUTE, GAME_ROUTE, SIMULATION_ROUTE } from './utils/consts';
import { SimulationPage } from './pages/Simulation/SimulationPage';


export const publicRoutes = [
  // { path: MAIN_ROUTE, Component: MenuPage },
  { path: GAME_ROUTE, Component: GamePage },
  { path: MAIN_ROUTE, Component: SimulationPage },
];

export const privateRoutes = [
  // ...
];
