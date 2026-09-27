export const enviromentConfig = {
  dev: {
    api_url: import.meta.env.VITE_API_URL_DEV,
    logEnabled: import.meta.env.VITE_BETTER_STACK_ENABLED,
    better_token: import.meta.env.VITE_BETTER_STACK_TOKEN
  },
  pil:{
    api_url: import.meta.env.VITE_API_URL_PIL,
    logEnabled: import.meta.env.VITE_BETTER_STACK_ENABLED,
    better_token: import.meta.env.VITE_BETTER_STACK_TOKEN
  },
  prod: {
    api_url: import.meta.env.VITE_API_URL_PROD,
    logEnabled: import.meta.env.VITE_BETTER_STACK_ENABLED,
    better_token: import.meta.env.VITE_BETTER_STACK_TOKEN
  }
};
