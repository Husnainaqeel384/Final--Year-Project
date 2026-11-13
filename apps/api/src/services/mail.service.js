import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { env, isProduction } from '../config/env.js';
import { logger } from '../config/logger.js';

export const isMailConfigured = Boolean(env.SMTP_HOST);

const transporter = isMailConfigured
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : null;

// Without SMTP, developers still need reset links. They go to a git-ignored
// folder rather than the log, because logs must never contain tokens.
const outbox = fileURLToPath(new URL('../../../../.dev-mail/', import.meta.url));

export async function sendMail({ to, subject, html }) {
  if (transporter) {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
    return;
  }
  if (isProduction) {
    logger.warn({ subject }, 'Email was not sent because SMTP is not configured');
    return;
  }
  await mkdir(outbox, { recursive: true });
  const file = `${Date.now()}-${subject.replace(/\W+/g, '-').toLowerCase()}.html`;
  await writeFile(`${outbox}${file}`, `<p>To: ${to}</p>${html}`);
  logger.info({ file }, 'SMTP is not configured; email saved to .dev-mail');
}

/** Minimal inline-styled layout, since email clients ignore stylesheets. */
export function actionEmail({ heading, text, actionLabel, actionUrl }) {
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#0b0b0b">
    <h1 style="font-size:20px">${heading}</h1>
    <p style="color:#52514e;line-height:1.5">${text}</p>
    <a href="${actionUrl}" style="display:inline-block;background:#1c5cab;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${actionLabel}</a>
    <p style="color:#898781;font-size:12px;margin-top:24px">If you weren't expecting this email, you can ignore it.</p>
  </div>`;
}
