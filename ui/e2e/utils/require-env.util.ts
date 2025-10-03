type RequiredEnvKey = 'ADMIN_EMAIL' | 'ADMIN_PASSWORD';

export const requireEnv = (key: RequiredEnvKey): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} environment variable`);
  }
  return value;
};
