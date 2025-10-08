import { getPrDetails, runAgent, applyPatch } from './lib/agent.mjs';
import { config, validateConfig } from './lib/config.mjs';
import pino from 'pino';

const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

/**
 * Main function to run the agent
 */
async function main() {
  try {
    validateConfig();
    const { PR_NUMBER, AGENT_DRY_RUN, PR_LABELS } = config;

    function canApply() {
      return !AGENT_DRY_RUN && PR_LABELS.includes("agent:apply");
    }

    const { title, body } = await getPrDetails(PR_NUMBER);
    const actions = await runAgent(PR_NUMBER, title, body, config);
    
    for (const action of actions) {
      if (action.name === "create_patch") {
        applyPatch(PR_NUMBER, action.args, !canApply());
      }
    }
  } catch (error) {
    logger.error(`Agent execution failed: ${error.message}`);
    
    if (config.PR_NUMBER) {
      try {
        execSync(`gh pr comment ${config.PR_NUMBER} --body "Agent execution failed: ${error.message.replace(/"/g, '\\"')}"`);
      } catch (commentError) {
        logger.error(`Failed to post error comment: ${commentError.message}`);
      }
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  logger.fatal(error);
  process.exit(1);
});

