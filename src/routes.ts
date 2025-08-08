// src/routes.ts (если у вас массив роутов)
// import MenuPage from './pages/MenuPage/MenuPage';
import { GamePage } from './pages/GamePage/GamePage';
import { MAIN_ROUTE, GAME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE } from './utils/consts';
// import { SimulationPage } from './pages/Simulation/SimulationPage';
import LoginPage from './pages/LoginPage/LoginPage';
import LobbyPage from './pages/LobbyPage/LobbyPage';


export const publicRoutes = [
  // { path: MAIN_ROUTE, Component: MenuPage },
  { path: GAME_ROUTE, Component: GamePage },
  { path: MAIN_ROUTE, Component: LobbyPage},
  { path: LOGIN_ROUTE, Component: LoginPage },
  { path: REGISTER_ROUTE, Component: LoginPage },
];

export const privateRoutes = [
  // ...
];
