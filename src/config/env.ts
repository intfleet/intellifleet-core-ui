// src/config/env.ts

const getEnv = (key: keyof ImportMetaEnv, required = true): string => {
  const value = import.meta.env[key];

  if (required && !value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value as string;
};

export const ENV = {
  MODE: import.meta.env.MODE,

  APP_NAME: getEnv('VITE_APP_NAME', false),
  API_BASE_URL: getEnv('VITE_API_BASE_URL'),
  

  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};