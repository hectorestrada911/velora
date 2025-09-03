declare global {
  interface Window {
    gapi?: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        calendar?: {
          events: {
            insert: (params: any) => Promise<{ status: number }>;
          };
        };
      };
    };
  }
}

export {};
