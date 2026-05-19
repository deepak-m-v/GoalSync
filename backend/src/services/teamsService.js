const config = require('../config');
const { buildManagerApprovalCard } = require('../teams/cards/managerApprovalPending');

function wrapAdaptiveCard(card) {
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: card,
      },
    ],
  };
}

async function postToWebhook(webhookUrl, payload) {
  if (!webhookUrl) return { skipped: true, reason: 'no_webhook' };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error('[teams] webhook failed:', res.status, text);
    return { ok: false, status: res.status, body: text };
  }

  return { ok: true, body: text };
}

async function sendAdaptiveCard(card, channel = 'default') {
  const webhooks = config.teams.webhooks || {};
  const url =
    (channel !== 'default' && webhooks[channel]) ||
    webhooks.approvals ||
    config.teams.webhookUrl;

  if (!config.teams.enabled || !url) {
    console.log('[teams] disabled — card:', card?.body?.[0]?.text);
    return { skipped: true };
  }

  return postToWebhook(url, wrapAdaptiveCard(card));
}

async function notifyManagerApprovalPending({
  employeeName,
  employeeEmail,
  goalCount,
  cycleName,
  approvalId,
  submittedAt,
}) {
  const card = buildManagerApprovalCard({
    employeeName,
    employeeEmail,
    goalCount,
    cycleName,
    approvalId,
    submittedAt,
  });
  return sendAdaptiveCard(card, 'approvals');
}

async function sendTestCard() {
  const card = buildManagerApprovalCard({
    employeeName: 'Demo Employee',
    employeeEmail: 'employee@goalsync.com',
    goalCount: 4,
    cycleName: 'FY 2026',
    approvalId: 1,
    submittedAt: new Date().toISOString(),
  });
  return sendAdaptiveCard(card, 'approvals');
}

module.exports = {
  wrapAdaptiveCard,
  sendAdaptiveCard,
  notifyManagerApprovalPending,
  sendTestCard,
  buildManagerApprovalCard,
};
