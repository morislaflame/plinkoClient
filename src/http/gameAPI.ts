import { $authHost } from "./index";

export interface Game {
  id: number;
  player_id: number;
  bet: number;
  win: number;
  createdAt: string;
  updatedAt: string;
}

export interface BetResult {
  betAmount: number;
  multiplier: number;
  winAmount: number;
  newBalance: number;
  sinkIndex: number;
  ballStartPosition: number;
}

export interface GameResponse {
  game: Game;
  message: string;
}

export interface BetResponse {
  game: Game;
  betResult: BetResult;
  message: string;
}

export interface GameHistoryResponse {
  games: Game[];
  message: string;
}

// Создать новую игру
export const startGame = async (): Promise<GameResponse> => {
  const { data } = await $authHost.post('api/game/start');
  return data;
};

// Сделать ставку в игре
export const makeBet = async (gameId: number, betAmount: number): Promise<BetResponse> => {
  const { data } = await $authHost.post('api/game/bet', {
    gameId,
    betAmount
  });
  return data;
};

// Получить историю игр
export const getGameHistory = async (limit: number = 10, offset: number = 0): Promise<GameHistoryResponse> => {
  const { data } = await $authHost.get(`api/game/history?limit=${limit}&offset=${offset}`);
  return data;
};

// Получить информацию о конкретной игре
export const getGameById = async (gameId: number): Promise<GameResponse> => {
  const { data } = await $authHost.get(`api/game/${gameId}`);
  return data;
};