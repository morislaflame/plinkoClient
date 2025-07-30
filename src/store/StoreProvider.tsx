import { createContext, useState, useEffect, type ReactNode } from "react";
import LoadingIndicator from "../components/ui/LoadingIndicator";
import UserStore from "./UserStore";
import GameStore from "./GameStore";
// Определяем интерфейс для нашего контекста
export interface IStoreContext {
  user: UserStore;
  game: GameStore;
}

let storeInstance: IStoreContext | null = null;

// Функция для получения экземпляра хранилища
export function getStore(): IStoreContext {
  if (!storeInstance) {
    throw new Error("Store not initialized");
  }
  return storeInstance;
}

// Создаем контекст с начальным значением null, но указываем правильный тип
export const Context = createContext<IStoreContext | null>(null);

// Добавляем типы для пропсов
interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  const [stores, setStores] = useState<{
    user: UserStore;
    game: GameStore;
  } | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      const [
        { default: UserStore },
        { default: GameStore },
      ] = await Promise.all([
        import("./UserStore"),
        import("./GameStore"),
      ]);

      setStores({
        user: new UserStore(),
        game: new GameStore(),
      });
    };

    loadStores();
  }, []);

  if (!stores) {
    return <LoadingIndicator />; // Use custom loading indicator
  }

  // Сохраняем экземпляр хранилища для доступа из других модулей
  storeInstance = stores;

  return <Context.Provider value={stores}>{children}</Context.Provider>;
};

export default StoreProvider;
