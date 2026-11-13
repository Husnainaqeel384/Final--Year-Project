// Creates the local .env on first run so `npm run dev` works straight after cloning.
// An existing .env is never touched: it may hold the developer's own credentials.
import { randomBytes } from 'node:crypto';
import { copyFile, readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));
const examplePath = fileURLToPath(new URL('../.env.example', import.meta.url));

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );

if (!(await exists(envPath))) {
  await copyFile(examplePath, envPath);

  // Each clone gets its own signing key so a published default can never be used to forge sessions.
  const contents = await readFile(envPath, 'utf8');
  await writeFile(
    envPath,
    contents.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${randomBytes(48).toString('hex')}`),
  );
  process.stdout.write('Created .env from .env.example\n');
}
