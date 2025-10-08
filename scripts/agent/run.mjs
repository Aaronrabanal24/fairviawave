import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import OpenAI from 'openai';

/**
 * Get the PR details from GitHub using the GitHub CLI
 * @param {string} prNumber - PR number to fetch details for
 * @returns {Object} - PR title and body
 */
async function getPrDetails(prNumber) {
  try {
    const prJson = execSync(`gh pr view ${prNumber} --json title,body`).toString();
    return JSON.parse(prJson);
  } catch (error) {
    console.error(`Failed to fetch PR details: ${error.message}`);
    throw error;
  }
}

/**
 * Run the agent to generate a patch based on PR details
 * @returns {Array} - List of actions to take
 */
async function runAgent() {
  const {
    AGENT_MODEL,
    AGENT_SYSTEM_PROMPT,
    OPENAI_API_KEY,
    PR_NUMBER
  } = process.env;

  if (!PR_NUMBER || !AGENT_MODEL || !AGENT_SYSTEM_PROMPT || !OPENAI_API_KEY) {
    console.error("Missing required environment variables for agent.");
    process.exit(1);
  }

  // Get PR details
  const { title, body } = await getPrDetails(PR_NUMBER);
  const prompt = `PR Title: ${title}\n\nPR Body:\n${body}`;
  
  console.log(`Processing PR #${PR_NUMBER}: ${title}`);

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  console.log(`Asking AI model (${AGENT_MODEL}) to generate a patch...`);
  
  const response = await openai.chat.completions.create({
    model: AGENT_MODEL,
    messages: [
      { role: "system", content: AGENT_SYSTEM_PROMPT },
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
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }

  // Validate response format
  if (!result.patch || !result.plan) {
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
 * Main function to run the agent
 */
async function main() {
  const DRY = String(process.env.AGENT_DRY_RUN || "true") === "true";
  const LABELS = (process.env.PR_LABELS || "").split(",");
  const PR_NUMBER = process.env.PR_NUMBER;

  function canApply() {
    return !DRY && LABELS.includes("agent:apply");
  }

  if (!PR_NUMBER) {
    console.error("PR_NUMBER environment variable is not set.");
    process.exit(1);
  }

  try {
    const actions = await runAgent();
    
    for (const action of actions) {
      const { name, args } = action;
      
      if (name === "create_patch") {
        const commentBody = `
## Agent Plan
${args.plan}

## Agent Proposed Patch
\`\`\`diff
${args.diff}
\`\`\`

${args.commands.length > 0 ? `## Commands to run
\`\`\`sh
${args.commands.join('\n')}
\`\`\`
` : ''}

${args.post_checks.length > 0 ? `## Post-deployment Checks
\`\`\`
${args.post_checks.join('\n')}
\`\`\`
` : ''}
`;

        if (!canApply()) {
          console.log("DRY RUN — patch proposed but not applied. Posting comment.");
          execSync(`gh pr comment ${PR_NUMBER} --body "${commentBody.replace(/"/g, '\\"')}"`);
        } else {
          console.log("Applying patch...");
          writeFileSync("agent.patch", args.diff);
          
          try {
            execSync(`git apply agent.patch`);
            execSync(`git add -A && git commit -m "${args.title}"`);
            execSync(`gh pr comment ${PR_NUMBER} --body "Agent patch applied.\n\n${commentBody.replace(/"/g, '\\"')}"`);
            console.log("Patch applied and committed.");
          } catch (error) {
            execSync(`gh pr comment ${PR_NUMBER} --body "Failed to apply patch: ${error.message.replace(/"/g, '\\"')}\n\n${commentBody.replace(/"/g, '\\"')}"`);
            console.error(`Failed to apply patch: ${error.message}`);
            process.exit(1);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Agent execution failed: ${error.message}`);
    
    if (PR_NUMBER) {
      try {
        execSync(`gh pr comment ${PR_NUMBER} --body "Agent execution failed: ${error.message.replace(/"/g, '\\"')}"`);
      } catch (commentError) {
        console.error(`Failed to post error comment: ${commentError.message}`);
      }
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
