import { startCronWorker } from './cron-worker';

export async function initializeWorkers() {
  console.log('[Workers] Initializing background workers...');

  startCronWorker().catch((error) => {
    console.error('[Workers] Cron worker failed:', error);
    process.exit(1);
  });

  console.log('[Workers] All workers initialized');
}

if (process.env.ENABLE_WORKER === 'true') {
  console.log('[Workers] Starting workers from startup...');
  initializeWorkers();
}
