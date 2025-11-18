export interface UserInfo {
    id: number;
    email?: string;
    password?: string;
    username?: string;
    role: string;
    balance: number;
}

export interface GameInfo {
    id: number;
    player_id: number;
    bet: number;
    win: number;
}

export interface TelegramWebApp {
    BackButton: {
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
      offClick: (callback: () => void) => void;
    };
    initData: {
      user: {
        id: number;
        first_name: string;
        last_name: string;
        username: string;
        photo_url: string;
      };
    };
    openInvoice: (url: string, callback: (status: string) => void) => void;
    shareToStory: (media_url: string, params: {
       text: string;
       widget_link: {
        url: string;
        name: string;
       }
    }) => void;
    openTelegramLink: (url: string) => void;
  }