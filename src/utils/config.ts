import { config } from 'dotenv';
import { z } from 'zod';

config();

const configSchema = z.object({
  JIRA_BASE_URL: z.string().url(),
  JIRA_USERNAME: z.string().email(),
  JIRA_API_TOKEN: z.string().min(1),
  ZEPHYR_API_TOKEN: z.string().min(1),
});

const validateConfig = () => {
  const result = configSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return result.data;
};

export const appConfig = validateConfig();

export const getJiraAuth = () => ({
  username: appConfig.JIRA_USERNAME,
  password: appConfig.JIRA_API_TOKEN,
});

export const getZephyrHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${appConfig.ZEPHYR_API_TOKEN}`,
  };
};