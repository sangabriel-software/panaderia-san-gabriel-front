export const enviromentConfig = {
  DEV: {
    api_url: import.meta.env.VITE_API_URL_DEV,
  },
  PROD: {
    api_url: import.meta.env.VITE_API_URL_PROD,
  },
};
