import { config } from 'dotenv';
import { z } from 'zod';

config();

const configSchema = z.object({
  JIRA_BASE_URL: z.string().url(),
  JIRA_USERNAME: z.string().email(),
  JIRA_API_TOKEN: z.string().min(1),
  ZEPHYR_API_TOKEN: z.string().min(1),
});

let cachedConfig: z.infer<typeof configSchema> | null = null;

const validateConfig = () => {
  try {
    const result = configSchema.safeParse(process.env);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
      console.error(errorMessage);
      console.error('Please ensure the following environment variables are set:');
      console.error('- JIRA_BASE_URL (valid URL)');
      console.error('- JIRA_USERNAME (valid email)');
      console.error('- JIRA_API_TOKEN (non-empty string)');
      console.error('- ZEPHYR_API_TOKEN (non-empty string)');
      throw new Error(errorMessage);
    }
    
    return result.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to validate configuration:', errorMessage);
    throw error;
  }
};

export const getAppConfig = () => {
  if (!cachedConfig) {
    cachedConfig = validateConfig();
  }
  return cachedConfig;
};

export const getJiraAuth = () => {
  const config = getAppConfig();
  return {
    username: config.JIRA_USERNAME,
    password: config.JIRA_API_TOKEN,
  };
};

export const getZephyrHeaders = () => {
  const config = getAppConfig();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.ZEPHYR_API_TOKEN}`,
  };
};