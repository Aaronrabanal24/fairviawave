import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import OpenAI from 'openai';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
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
 * Get the PR details from GitHub using the GitHub CLI
 * @param {string} prNumber - PR number to fetch details for
 * @returns {Object} - PR title and body
 */
export async function getPrDetails(prNumber) {
  try {
    logger.info(`Fetching PR details for #${prNumber}...`);
    const prJson = execSync(`gh pr view ${prNumber} --json title,body`).toString();
    const details = JSON.parse(prJson);
    logger.info(`PR details fetched for #${prNumber}: ${details.title}`);
    return details;
  } catch (error) {
    logger.error(`Failed to fetch PR details: ${error.message}`);
    throw error;
  }
}

/**
 * Run the agent to generate a patch based on PR details
 * @param {string} prNumber - PR number
 * @param {string} title - PR title
 * @param {string} body - PR body
 * @param {Object} config - Agent configuration
 * @returns {Array} - List of actions to take
 */
export async function runAgent(prNumber, title, body, config) {
  const prompt = `PR Title: ${title}\n\nPR Body:\n${body}`;
  
  logger.info(`Processing PR #${prNumber}: ${title}`);

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

  logger.info(`Asking AI model (${config.AGENT_MODEL}) to generate a patch...`);
  
  const response = await openai.chat.completions.create({
    model: config.AGENT_MODEL,
    messages: [
      { role: "system", content: config.AGENT_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("AI returned an empty response.");
  }

  // Parse the response
  let result;
  try {
    result = JSON.parse(content);
    logger.info('AI response parsed successfully.');
  } catch (error) {
    logger.error(`Failed to parse AI response as JSON: ${error.message}`);
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }

  // Validate response format
  if (!result.patch || !result.plan) {
    logger.warn("AI response is missing required fields: 'patch' or 'plan'");
    throw new Error("AI response is missing required fields: 'patch' or 'plan'");
  }

  return [
    {
      name: "create_patch",
      args: {
        diff: result.patch,
        title: `agent: ${title}`,
        plan: result.plan,
        commands: result.commands || [],
        post_checks: result.post_checks || [],
      },
    },
  ];
}

/**
 * Apply the patch to the codebase
 * @param {string} prNumber - PR number
 * @param {Object} patch - Patch details
 * @param {boolean} dryRun - Whether to do a dry run
 */
export function applyPatch(prNumber, patch, dryRun) {
  const commentBody = `
## Agent Plan
${patch.plan}

## Agent Proposed Patch
\`\`\`diff
${patch.diff}
\`\`\`

${patch.commands.length > 0 ? `## Commands to run
\`\`\`sh
${patch.commands.join('\n')}
\`\`\`
` : ''}

${patch.post_checks.length > 0 ? `## Post-deployment Checks
\`\`\`
${patch.post_checks.join('\n')}
\`\`\`
` : ''}
`;

  if (dryRun) {
    logger.info("DRY RUN — patch proposed but not applied. Posting comment.");
    execSync(`gh pr comment ${prNumber} --body "${commentBody.replace(/"/g, '\\"')}"`);
  } else {
    logger.info("Applying patch...");
    try {
      writeFileSync("agent.patch", patch.diff);
      execSync(`git apply agent.patch`);
      execSync(`git add -A && git commit -m "${patch.title}"`);
      execSync(`gh pr comment ${prNumber} --body "Agent patch applied.\n\n${commentBody.replace(/"/g, '\\"')}"`);
      logger.info("Patch applied and committed.");
    } catch (error) {
      logger.error(`Failed to apply patch: ${error.message}`);
      execSync(`gh pr comment ${prNumber} --body "Failed to apply patch: ${error.message.replace(/"/g, '\\"')}\n\n${commentBody.replace(/"/g, '\\"')}"`);
      throw error;
    }
  }
}
