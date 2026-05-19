const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/escalation/engine.js');
let s = fs.readFileSync(file, 'utf8');
const start = s.indexOf('async function notifyAndEmail');
const end = s.indexOf('async function processViolation');
const fixed = `async function notifyAndEmail({ escalation, notifyUser, copy, ruleId }) {
  if (!notifyUser) return;
  await createNotification({
    userId: notifyUser.id,
    title: copy.title,
    message: copy.message,
    type: 'escalation',
    link: copy.link,
  });
  const emailBody = [
    '<motiondiv style="font-family:Inter,sans-serif;max-width:560px">',
    '<h2 style="color:#059669">', copy.title, '</h2>',
    '<p>', copy.message, '</p>',
    '<p><a href="', copy.link, '">Open GoalSync AI</a></p>',
    '</motiondiv>',
  ].join('').replace(/motiondiv/g, 'motionmotionmotionmotionmotionmotionmotionmotionmotiondiv').replace(/motionmotionmotionmotionmotionmotionmotionmotionmotiondiv/g, 'div');
  await queueEmail({
    userId: notifyUser.id,
    toEmail: notifyUser.email,
    subject: copy.title,
    body: emailBody,
    escalationId: escalation.id,
  });
  await writeLog(escalation.id, {
    ruleId,
    action: LOG_ACTIONS.EMAIL_QUEUED,
    level: escalation.level,
    message: 'Queued email to ' + notifyUser.email,
  });
}

`;
fs.writeFileSync(file, s.slice(0, start) + fixed + s.slice(end));
console.log('fixed');
