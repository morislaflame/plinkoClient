import { makeAutoObservable, runInAction } from "mobx";
import { startGame, makeBet, getGameHistory, getGameById, type Game } from "../http/gameAPI";
import { AxiosError } from "axios";

export default class GameStore {
  _currentGame: Game | null = null;
  _games: Game[] = [];
  _loading = false;
  _betLoading = false;
  isTooManyRequests = false;
  isServerError = false;
  serverErrorMessage = '';

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentGame(game: Game | null) {
    this._currentGame = game;
  }

  setGames(games: Game[]) {
    this._games = games;
  }

  setLoading(loading: boolean) {
    this._loading = loading;
  }

  setBetLoading(loading: boolean) {
    this._betLoading = loading;
  }

  setTooManyRequests(flag: boolean) {
    this.isTooManyRequests = flag;
  }

  setServerError(flag: boolean, message: string = '') {
    this.isServerError = flag;
    this.serverErrorMessage = message;
  }

  // Создать новую игру
  async createGame() {
    try {
      this.setLoading(true);
      this.setServerError(false);
      
      const response = await startGame();
      
      runInAction(() => {
        this.setCurrentGame(response.game);
        this.setLoading(false);
      });
      
      return response.game;
    } catch (error: unknown) {
      console.error("Error creating game:", error);
      runInAction(() => {
        this.setLoading(false);
        this.setServerError(true, (error as AxiosError).message || 'Failed to create game');
        
        if ((error as AxiosError).response?.status === 429) {
          this.setTooManyRequests(true);
        }
      });
      throw error;
    }
  }

  // Сделать ставку
  async placeBet(gameId: number, betAmount: number) {
    try {
      this.setBetLoading(true);
      this.setServerError(false);
      
      const response = await makeBet(gameId, betAmount);
      
      runInAction(() => {
        this.setCurrentGame(response.game);
        this.setBetLoading(false);
      });
      
      return response;
    } catch (error: unknown) {
      console.error("Error placing bet:", error);
      runInAction(() => {
        this.setBetLoading(false);
        this.setServerError(true, (error as AxiosError).message || 'Failed to place bet');
        
        if ((error as AxiosError).response?.status === 429) {
          this.setTooManyRequests(true);
        }
      });
      throw error;
    }
  }

  // Получить историю игр
  async fetchGameHistory(limit: number = 10, offset: number = 0) {
    try {
      this.setLoading(true);
      this.setServerError(false);
      
      const response = await getGameHistory(limit, offset);
      
      runInAction(() => {
        this.setGames(response.games);
        this.setLoading(false);
      });
      
      return response.games;
    } catch (error: unknown) {
      console.error("Error fetching game history:", error);
      runInAction(() => {
        this.setLoading(false);
        this.setServerError(true, (error as AxiosError).message || 'Failed to fetch game history');
        
        if ((error as AxiosError).response?.status === 429) {
          this.setTooManyRequests(true);
        }
      });
      throw error;
    }
  }

  // Получить информацию о конкретной игре
  async fetchGameById(gameId: number) {
    try {
      this.setLoading(true);
      this.setServerError(false);
      
      const response = await getGameById(gameId);
      
      runInAction(() => {
        this.setCurrentGame(response.game);
        this.setLoading(false);
      });
      
      return response.game;
    } catch (error: unknown) {
      console.error("Error fetching game:", error);
      runInAction(() => {
        this.setLoading(false);
        this.setServerError(true, (error as Error).message || 'Failed to fetch game');
        
        if ((error as AxiosError).response?.status === 429) {
          this.setTooManyRequests(true);
        }
      });
      throw error;
    }
  }

  // Очистить текущую игру
  clearCurrentGame() {
    this.setCurrentGame(null);
  }

  // Очистить ошибки
  clearErrors() {
    this.setServerError(false);
    this.setTooManyRequests(false);
  }

  // Геттеры
  get currentGame() {
    return this._currentGame;
  }

  get games() {
    return this._games;
  }

  get loading() {
    return this._loading;
  }

  get betLoading() {
    return this._betLoading;
  }

  // Проверка, активна ли игра
  get isGameActive() {
    return this._currentGame !== null;
  }

  // Получить общую сумму ставок в текущей игре
  get currentGameTotalBet() {
    return this._currentGame?.bet || 0;
  }

  // Получить общий выигрыш в текущей игре
  get currentGameTotalWin() {
    return this._currentGame?.win || 0;
  }
}