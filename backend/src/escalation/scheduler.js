const cron = require('node-cron');
const config = require('../config');
const { runEscalationEngine, processEmailQueue } = require('./engine');

let engineTask;
let retryTask;

function startEscalationScheduler() {
  if (!config.escalation.cronEnabled) {
    console.log('[escalation] cron disabled (ESCALATION_CRON_ENABLED=false)');
    return;
  }

  if (engineTask) return;

  engineTask = cron.schedule(config.escalation.cronSchedule, async () => {
    try {
      const result = await runEscalationEngine();
      console.log('[escalation] engine run:', JSON.stringify(result));
    } catch (err) {
      console.error('[escalation] engine error:', err.message);
    }
  });

  retryTask = cron.schedule(config.escalation.retryCronSchedule, async () => {
    try {
      const result = await processEmailQueue();
      if (result.sent || result.failed) {
        console.log('[escalation] email retry:', JSON.stringify(result));
      }
    } catch (err) {
      console.error('[escalation] email retry error:', err.message);
    }
  });

  console.log('[escalation] scheduler started:', config.escalation.cronSchedule);
}

function stopEscalationScheduler() {
  if (engineTask) engineTask.stop();
  if (retryTask) retryTask.stop();
  engineTask = null;
  retryTask = null;
}

module.exports = { startEscalationScheduler, stopEscalationScheduler };
