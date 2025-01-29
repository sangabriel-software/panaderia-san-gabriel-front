export const enviromentConfig = {
  dev: {
    api_url: import.meta.env.VITE_API_URL_DEV,
  },
  pil:{
    api_url: import.meta.env.VITE_API_URL_PIL,
  },
  prod: {
    api_url: import.meta.env.VITE_API_URL_PROD,
  }
};
