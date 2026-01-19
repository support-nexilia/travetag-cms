import { deleteJob, getNextPendingJob, updateJobStatus, retryJob } from '@/data/cron-jobs';
import { executeCronJob } from '@/services/cron-handlers';
import { registerAllCronHandlers } from '@/services/cron-handlers/register-all';

const POLL_INTERVAL_MS = 5000;

let isRunning = false;
let isTickRunning = false;
let pollInterval: NodeJS.Timeout | null = null;

export async function startCronWorker() {
  if (isRunning) {
    console.log('[CronWorker] Already running');
    return;
  }

  isRunning = true;
  console.log('═══════════════════════════════════════════════');
  console.log('🚀 [CronWorker] Started successfully');
  console.log('   Mode: Single instance');
  console.log(`   Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
  console.log('═══════════════════════════════════════════════');

  registerAllCronHandlers();

  const tick = async () => {
    if (!isRunning || isTickRunning) {
      return;
    }
    isTickRunning = true;

    try {
      const job = await getNextPendingJob();

      if (!job) {
        return;
      }

      console.log(`[CronWorker] Processing job ${job._id} (type: ${job.jobType})`);

      try {
        await executeCronJob(job);
        await deleteJob(job._id.toString(), job.jobKey);
        console.log(`[CronWorker] Job ${job._id} completed successfully`);
      } catch (error: any) {
        console.error(`[CronWorker] Job ${job._id} failed:`, error);

        await updateJobStatus(job._id.toString(), 'failed', null, {
          message: error.message,
          stack: error.stack,
        }, job.jobKey);

        await retryJob(job._id.toString());
      }
    } catch (error) {
      console.error('[CronWorker] Error in tick:', error);
    } finally {
      isTickRunning = false;
    }
  };

  pollInterval = setInterval(tick, POLL_INTERVAL_MS);
  await tick();
}

export function stopCronWorker() {
  console.log('[CronWorker] Stopping...');
  isRunning = false;

  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

process.on('SIGTERM', () => {
  stopCronWorker();
  process.exit(0);
});

process.on('SIGINT', () => {
  stopCronWorker();
  process.exit(0);
});
