import { configuredStore } from './persistence/Store';
import { createArenaServer } from './network/server';
const arena = await createArenaServer(configuredStore());
arena.http.listen(Number(process.env.PORT ?? 3000), '0.0.0.0', () =>
  console.log('Aether Arena listening on port', process.env.PORT ?? 3000),
);
process.once('SIGTERM', () => void arena.close());
