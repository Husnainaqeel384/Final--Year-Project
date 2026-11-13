import { Readable } from 'node:stream';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { z } from 'zod';
import { env } from '../config/env.js';
import { db } from '../db/knex.js';
import { AppError, notFound } from '../utils/errors.js';
import { buildCalendar } from '../utils/ics.js';
import { dateToMonth, monthRange } from '../utils/months.js';
import { applyScope, scopeColumns, scopeKey } from '../utils/scope.js';
import { amount, dateOnly, requiredText } from '../utils/schemas.js';
import { createOpaqueToken, hashToken } from '../utils/tokens.js';
import { resolveExpenseBudget } from './budget.service.js';
import { getReport } from './report.service.js';

const MAX_IMPORT_ROWS = 5000;

const DATASETS = {
  transactions: {
    table: 'transactions',
    columns: [
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'From', key: 'sender', width: 26 },
      { header: 'To', key: 'receiver', width: 26 },
      { header: 'Method', key: 'method', width: 18 },
      { header: 'Amount', key: 'amount', width: 14, money: true },
      { header: 'Description', key: 'description', width: 40 },
    ],
    dateColumn: 'date',
    importSchema: z.object({
      date: dateOnly,
      type: z.string().trim().toLowerCase().pipe(z.enum(['sent', 'received', 'pending'])),
      sender: requiredText(100),
      receiver: requiredText(100),
      method: requiredText(60),
      amount: z.coerce.number().pipe(amount),
      description: z.string().trim().max(255).default(''),
    }),
    sample: { date: '2026-03-15', type: 'sent', sender: 'Your name', receiver: 'City Utilities', method: 'Card', amount: 84.5, description: 'March bill' },
  },
  expenses: {
    table: 'expenses',
    columns: [
      { header: 'Date', key: 'spent_on', width: 14 },
      { header: 'Category', key: 'category_name', width: 26 },
      { header: 'Amount', key: 'amount', width: 14, money: true },
      { header: 'Description', key: 'description', width: 40 },
    ],
    dateColumn: 'spent_on',
    importSchema: z.object({
      spent_on: dateOnly,
      category_name: requiredText(100),
      amount: z.coerce.number().pipe(amount),
      description: z.string().trim().max(255).default(''),
    }),
    sample: { spent_on: '2026-03-15', category_name: 'Groceries', amount: 62.4, description: 'Weekly shop' },
  },
};

/** Stops spreadsheet apps from running a cell like =HYPERLINK(...) when an export is opened. */
export function neutralizeFormula(value) {
  return typeof value === 'string' && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function createSheet(columns, rows, name) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Budget Book';
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns.map(({ header, key, width }) => ({ header, key, width }));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  for (const row of rows) {
    sheet.addRow(Object.fromEntries(columns.map(({ key }) => [key, neutralizeFormula(row[key])])));
  }
  for (const { key, money } of columns) {
    if (money) sheet.getColumn(key).numFmt = '#,##0.00';
  }
  return workbook;
}

const toBuffer = async (workbook, format) =>
  Buffer.from(format === 'csv' ? await workbook.csv.writeBuffer() : await workbook.xlsx.writeBuffer());

export async function exportDataset(workspace, dataset, format, month) {
  const config = DATASETS[dataset];
  const rows = await applyScope(db(config.table), workspace)
    .modify((query) => {
      if (month) {
        const [start, end] = monthRange(month);
        query.where(config.dateColumn, '>=', start).where(config.dateColumn, '<', end);
      }
    })
    .orderBy(config.dateColumn, 'desc')
    .limit(50000);
  return toBuffer(createSheet(config.columns, rows, dataset), format);
}

export async function exportBudget(workspace, month, format) {
  const report = await getReport(workspace, month);
  const columns = [
    { header: 'Category', key: 'categoryName', width: 28 },
    { header: 'Planned', key: 'amount', width: 14, money: true },
    { header: 'Spent', key: 'spent', width: 14, money: true },
    { header: 'Remaining', key: 'remaining', width: 14, money: true },
  ];
  return toBuffer(createSheet(columns, report.items, `Budget ${month}`), format);
}

export function buildTemplate(dataset) {
  const { columns, sample } = DATASETS[dataset];
  return toBuffer(createSheet(columns, [sample], 'Template'), 'xlsx');
}

function normalizeCell(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    if (value.richText) return value.richText.map((part) => part.text).join('');
    if ('result' in value) return normalizeCell(value.result);
    if ('text' in value) return String(value.text);
    return '';
  }
  return typeof value === 'string' ? value.trim() : value;
}

/** Read as a stream with a row cap, so an oversized sheet is rejected without loading it all. */
async function readRows(file) {
  const isZip = file.buffer[0] === 0x50 && file.buffer[1] === 0x4b;
  if (isZip) {
    const rows = [];
    const reader = new ExcelJS.stream.xlsx.WorkbookReader(Readable.from(file.buffer), {
      sharedStrings: 'cache',
      hyperlinks: 'ignore',
      styles: 'cache',
      worksheets: 'emit',
    });
    for await (const worksheet of reader) {
      for await (const row of worksheet) {
        rows.push(Array.from(row.values).map(normalizeCell));
        if (rows.length > MAX_IMPORT_ROWS + 1) return rows;
      }
      // Only the first sheet is imported.
      break;
    }
    return rows;
  }

  if (!file.originalname?.toLowerCase().endsWith('.csv')) {
    throw new AppError('Upload an Excel (.xlsx) or CSV file');
  }
  const workbook = new ExcelJS.Workbook();
  const sheet = await workbook.csv.read(Readable.from(file.buffer));
  const rows = [];
  sheet.eachRow((row) => rows.push(Array.from(row.values).map(normalizeCell)));
  return rows;
}

export async function importDataset(workspace, dataset, file) {
  if (!file) throw new AppError('Choose a file to import');

  const config = DATASETS[dataset];
  const rows = await readRows(file);
  if (rows.length < 2) throw new AppError('That file has no data rows');
  if (rows.length > MAX_IMPORT_ROWS + 1) {
    throw new AppError(`Files can contain at most ${MAX_IMPORT_ROWS} rows`);
  }

  const headers = rows[0].map((header) => String(header).trim().toLowerCase());
  const positions = config.columns.map(({ header, key }) => [key, headers.indexOf(header.toLowerCase())]);
  const missing = config.columns.filter((_, index) => positions[index][1] === -1).map(({ header }) => header);
  if (missing.length > 0) throw new AppError(`Missing columns: ${missing.join(', ')}`);

  const valid = [];
  const errors = [];
  rows.slice(1).forEach((row, index) => {
    const candidate = Object.fromEntries(positions.map(([key, position]) => [key, row[position]]));
    const result = config.importSchema.safeParse(candidate);
    if (result.success) valid.push({ ...scopeColumns(workspace), ...result.data });
    // +2 converts to the row number the person sees in their spreadsheet.
    else errors.push(`Row ${index + 2}: ${result.error.issues[0].path[0]} — ${result.error.issues[0].message}`);
  });

  // Imported expenses join their month's budget when the month has exactly one.
  if (dataset === 'expenses') {
    const budgetByMonth = new Map();
    for (const row of valid) {
      const month = dateToMonth(row.spent_on);
      if (!budgetByMonth.has(month)) budgetByMonth.set(month, await resolveExpenseBudget(workspace, row.spent_on));
      row.budget_id = budgetByMonth.get(month);
    }
  }

  if (valid.length > 0) await db.batchInsert(config.table, valid, 500);

  return { total: rows.length - 1, imported: valid.length, errors };
}

export async function buildReportPdf(workspace, month) {
  const report = await getReport(workspace, month);
  const { currency } = workspace;
  const format = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  const title = new Date(`${month}-15T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: `Budget report ${month}`, Author: 'Budget Book' } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const ink = '#0b0b0b';
    const muted = '#6f6d67';
    const line = '#e1e0d9';
    const left = 50;
    const width = doc.page.width - 100;

    doc.fillColor(ink).font('Helvetica-Bold').fontSize(20).text('Budget report', left, 50);
    doc.fillColor(muted).font('Helvetica').fontSize(11).text(title, left, 76);

    const figures = [
      ['Income', report.income],
      ['Planned', report.planned],
      ['Spent', report.spent],
      ['Savings goal', report.savingsGoal],
    ];
    figures.forEach(([label, value], index) => {
      const x = left + (index * width) / figures.length;
      doc.fillColor(muted).font('Helvetica').fontSize(9).text(label, x, 112);
      doc.fillColor(ink).font('Helvetica-Bold').fontSize(13).text(format(value), x, 125);
    });

    const columns = [
      { label: 'Category', x: left, width: 215, align: 'left' },
      { label: 'Planned', x: left + 215, width: 90, align: 'right' },
      { label: 'Spent', x: left + 305, width: 90, align: 'right' },
      { label: 'Remaining', x: left + 395, width: width - 395, align: 'right' },
    ];

    const drawHeader = (y) => {
      doc.fillColor(muted).font('Helvetica-Bold').fontSize(9);
      columns.forEach((column) => doc.text(column.label, column.x, y, { width: column.width, align: column.align }));
      doc.moveTo(left, y + 15).lineTo(left + width, y + 15).lineWidth(0.5).strokeColor(line).stroke();
      return y + 23;
    };

    let y = drawHeader(170);
    doc.font('Helvetica').fontSize(10);
    for (const item of report.items) {
      if (y > doc.page.height - 70) {
        doc.addPage();
        y = drawHeader(50);
        doc.font('Helvetica').fontSize(10);
      }
      doc.fillColor(ink);
      doc.text(item.categoryName, columns[0].x, y, { width: columns[0].width, lineBreak: false, ellipsis: true });
      doc.text(format(item.amount), columns[1].x, y, { width: columns[1].width, align: 'right' });
      doc.text(format(item.spent), columns[2].x, y, { width: columns[2].width, align: 'right' });
      doc.fillColor(item.remaining < 0 ? '#b42f2f' : ink);
      doc.text(format(item.remaining), columns[3].x, y, { width: columns[3].width, align: 'right' });
      y += 20;
    }

    doc.end();
  });
}

export async function listFeeds(workspace) {
  return db('integration_feeds')
    .where({ scope_key: scopeKey(workspace) })
    .select('id', 'kind', 'created_at as createdAt', 'last_used_at as lastUsedAt');
}

export async function createFeed(workspace, kind) {
  const { token, hash } = createOpaqueToken();
  const key = scopeKey(workspace);

  await db.transaction(async (trx) => {
    // Creating a link replaces the old one, which is also how a leaked link is revoked.
    await trx('integration_feeds').where({ scope_key: key, kind }).delete();
    await trx('integration_feeds').insert({
      user_id: workspace.userId,
      organization_id: workspace.organizationId,
      scope_key: key,
      kind,
      token_hash: hash,
    });
  });

  const path = kind === 'calendar' ? 'reminders.ics' : 'transactions.csv';
  return { kind, url: `${env.APP_URL}/feeds/${token}/${path}` };
}

export async function deleteFeed(workspace, id) {
  const removed = await db('integration_feeds').where({ id, scope_key: scopeKey(workspace) }).delete();
  if (!removed) throw notFound('Link');
}

/** Membership is rechecked on every read: someone removed from a team loses their links with it. */
async function resolveFeed(token, kind) {
  const feed = await db('integration_feeds').where({ token_hash: hashToken(token), kind }).first();
  if (!feed) throw notFound('Feed');

  if (feed.organization_id) {
    const member = await db('organization_members')
      .where({ organization_id: feed.organization_id, user_id: feed.user_id })
      .first('user_id');
    if (!member) throw notFound('Feed');
  }

  await db('integration_feeds').where({ id: feed.id }).update({ last_used_at: new Date() });
  return { userId: feed.user_id, organizationId: feed.organization_id };
}

export async function readCalendarFeed(token) {
  const workspace = await resolveFeed(token, 'calendar');
  const reminders = await applyScope(db('reminders'), workspace).where({ status: 'pending' }).orderBy('due_date');
  return buildCalendar(reminders);
}

export async function readTransactionsFeed(token) {
  const workspace = await resolveFeed(token, 'sheets');
  return exportDataset(workspace, 'transactions', 'csv');
}
