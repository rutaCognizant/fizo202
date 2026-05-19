import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const filePath = resolve('.output/server/index.mjs');
const importLine = "import 'dotenv/config';\n";

async function main() {
  let contents;

  try {
    contents = await readFile(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Cannot patch ${filePath} because it does not exist yet. Run the build first.`);
    }

    throw error;
  }

  if (contents.startsWith(importLine) || contents.includes(importLine)) {
    return;
  }

  await writeFile(filePath, `${importLine}${contents}`);
  console.log(`Prepended dotenv import to ${filePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
