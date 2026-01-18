module.exports = async (context) => {
  const { tool, params } = context;

  // Enforce Bun over NPM/Node
  if (tool === 'run_shell_command') {
    const command = params.command.trim();
    
    // Block npm
    if (command.match(/^npm\s+(?!view|search|info|root|ls)/)) {
       return {
        allowed: false,
        message: "STRICT MODE: NPM is banned. Use 'bun' instead (e.g., 'bun install', 'bun run')."
      };
    }

    // Block npx
    if (command.match(/^npx\s+/)) {
       return {
        allowed: false,
        message: "STRICT MODE: NPX is banned. Use 'bun x' or 'bun run' instead."
      };
    }

    // Block node direct usage (prefer bun)
    if (command.startsWith('node ') && !command.includes('dist/') && !command.includes('node_modules')) {
       return {
        allowed: false,
        message: "STRICT MODE: Node.js execution is discouraged. Use 'bun run <script>' for TypeScript/JavaScript execution."
      };
    }

    // Block tsx/ts-node
    if (command.includes('tsx ') || command.includes('ts-node ')) {
       return {
        allowed: false,
        message: "STRICT MODE: TSX/ts-node is deprecated. Bun handles TypeScript natively. Use 'bun run'."
      };
    }
  }

  // Enforce ArkType over Zod and verify extensions
  if (tool === 'write_file' || tool === 'replace') {
    const content = params.content || params.new_string;
    const filePath = params.file_path || "";

    // Block .js files (except specific configs if absolutely needed, but we prefer TS)
    // Allow dist/, build/, .gemini/, and specific config files that tool might need in JS
    if (filePath.endsWith('.js') && 
        !filePath.includes('node_modules') && 
        !filePath.includes('dist/') && 
        !filePath.includes('build/') &&
        !filePath.includes('.gemini/') &&
        !filePath.endsWith('.config.js') // Temporary allowance, but we moved postcss
       ) {
        // Warn or Block? User said "If something was accidentally made with raw javascript then move to typescript."
        // We will warn for now or return a message? The tool prevents *writing* JS.
        // Let's be strict but allow legitimate config files if they *must* be JS.
        // But we just moved postcss to TS.
        // Let's block new JS files in src/client/server.
        if (filePath.includes('client/src') || filePath.includes('server/') || filePath.includes('shared/')) {
             return {
                allowed: false,
                message: "STRICT MODE: JavaScript (.js) files are banned in source directories. Use TypeScript (.ts/.tsx)."
            };
        }
    }

    if (content) {
      if (content.match(/from\s+['"]zod['"]/)) {
        return {
          allowed: false,
          message: "STRICT MODE: Zod is banned. Use ArkType ('arktype') for schema validation."
        };
      }
      if (content.match(/require\(['"]zod['"]\)/)) {
        return {
          allowed: false,
          message: "STRICT MODE: Zod is banned. Use ArkType ('arktype') for schema validation."
        };
      }
      if (content.match(/from\s+['"]drizzle-zod['"]/)) {
        return {
          allowed: false,
          message: "STRICT MODE: drizzle-zod is banned. Use 'drizzle-arktype'."
        };
      }
    }
  }

  return { allowed: true };
};