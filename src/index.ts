import { extractInstagramReel } from "./integrations/instagram";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("usage: npm run dev -- <instagram-reel-url>");
    process.exitCode = 1;
    return;
  }

  const result = await extractInstagramReel(url);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
