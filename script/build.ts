import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client for Cloudflare Pages...");
  await viteBuild();

  console.log("build complete - output in dist/");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
