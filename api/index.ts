import app from '../artifacts/api-server/src/app';
import { ensureDefaultAdmin } from '../artifacts/api-server/src/index';

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    await ensureDefaultAdmin();
    initialized = true;
  }
  return app(req, res);
}
