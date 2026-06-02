export {};

declare global {
  interface Window {
    AeternaApp?: {
      sharePage: (title: string, text: string) => void;
      downloadApp: () => void;
      goHome: () => void;
    };
  }
}
