import 'dotenv/config';

export const config = {
  AGENT_MODEL: process.env.AGENT_MODEL || 'gpt-4-turbo-preview',
  AGENT_SYSTEM_PROMPT: process.env.AGENT_SYSTEM_PROMPT || 'You are a helpful AI assistant. You are tasked with generating a patch file for a given pull request.',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PR_NUMBER: process.env.PR_NUMBER,
  AGENT_DRY_RUN: String(process.env.AGENT_DRY_RUN || "true") === "true",
  PR_LABELS: (process.env.PR_LABELS || "").split(","),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

export function validateConfig() {
  const required = ['OPENAI_API_KEY', 'PR_NUMBER'];
  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
