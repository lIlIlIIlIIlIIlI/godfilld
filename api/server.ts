import { configuredStore } from '../server/src/persistence/Store.js';
import { createArenaServer } from '../server/src/network/server.js';
const arena = await createArenaServer(configuredStore());
export default arena.http;
