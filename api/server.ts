import { configuredStore } from '../server/src/persistence/Store';
import { createArenaServer } from '../server/src/network/server';
const arena = await createArenaServer(configuredStore());
export default arena.http;
