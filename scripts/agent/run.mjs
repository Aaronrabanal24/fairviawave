import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

// This is a placeholder for your actual agent logic.
// It should return a list of actions to take.
async function runAgent() {
  // Replace this with your actual agent implementation.
  // For demonstration, this returns a sample "create_patch" action.
  return [
    {
      name: "create_patch",
      args: {
        diff: `--- a/app/api/health/route.ts
+++ b/app/api/health/route.ts
@@ -1,5 +1,7 @@
-export async function GET() {
-  return new Response("OK");
+import { NextResponse } from "next/server";
+
+export async function GET(req: Request) {
+  return NextResponse.json({ status: "ok" });
 }
`,
        title: "Fix health check endpoint",
      },
    },
  ];
}

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

  const actions = await runAgent();

  for (const action of actions) {
    const { name, args } = action;
    if (name === "create_patch") {
      if (!canApply()) {
        console.log("DRY RUN — patch proposed but not applied");
        const commentBody = `Agent proposed patch:

\`\`\`diff
${args.diff}
\`\`\``;
        execSync(`gh pr comment ${PR_NUMBER} --body "${commentBody}"`);
      } else {
        console.log("Applying patch...");
        writeFileSync("agent.patch", args.diff);
        execSync(`git apply agent.patch`);
        execSync(`git add -A && git commit -m "agent: ${args.title}"`);
        console.log("Patch applied and committed.");
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
