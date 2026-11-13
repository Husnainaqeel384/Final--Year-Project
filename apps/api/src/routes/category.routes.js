import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/knex.js';
import { requireAdmin } from '../middlewares/auth.js';
import { blockDemoWrites } from '../middlewares/demo.js';
import { validate } from '../middlewares/validate.js';
import { notFound } from '../utils/errors.js';
import { idParam, requiredText } from '../utils/schemas.js';

const router = Router();
// Categories are shared by every account, so the demo admin may only look.
router.use(blockDemoWrites);

const nameBody = z.object({ name: requiredText(100) });

router.get('/', async (_req, res) => {
  const [categories, subcategories] = await Promise.all([
    db('categories').orderBy('name'),
    db('subcategories').orderBy('name'),
  ]);
  res.json({
    success: true,
    data: categories.map((category) => ({
      id: category.id,
      name: category.name,
      subcategories: subcategories
        .filter((item) => item.category_id === category.id)
        .map((item) => ({ id: item.id, name: item.name })),
    })),
  });
});

router.post('/', requireAdmin, validate({ body: nameBody }), async (req, res) => {
  await db('categories').insert({ name: req.valid.body.name });
  res.status(201).json({ success: true });
});

router.patch('/subcategories/:id', requireAdmin, validate({ params: idParam, body: nameBody }), async (req, res) => {
  const found = await db('subcategories').where({ id: req.valid.params.id }).first('id');
  if (!found) throw notFound('Subcategory');
  await db('subcategories').where({ id: found.id }).update({ name: req.valid.body.name });
  res.json({ success: true });
});

router.delete('/subcategories/:id', requireAdmin, validate({ params: idParam }), async (req, res) => {
  const removed = await db('subcategories').where({ id: req.valid.params.id }).delete();
  if (!removed) throw notFound('Subcategory');
  res.json({ success: true });
});

router.patch('/:id', requireAdmin, validate({ params: idParam, body: nameBody }), async (req, res) => {
  const found = await db('categories').where({ id: req.valid.params.id }).first('id');
  if (!found) throw notFound('Category');
  await db('categories').where({ id: found.id }).update({ name: req.valid.body.name });
  res.json({ success: true });
});

router.delete('/:id', requireAdmin, validate({ params: idParam }), async (req, res) => {
  const removed = await db('categories').where({ id: req.valid.params.id }).delete();
  if (!removed) throw notFound('Category');
  res.json({ success: true });
});

router.post('/:id/subcategories', requireAdmin, validate({ params: idParam, body: nameBody }), async (req, res) => {
  const found = await db('categories').where({ id: req.valid.params.id }).first('id');
  if (!found) throw notFound('Category');
  await db('subcategories').insert({ category_id: found.id, name: req.valid.body.name });
  res.status(201).json({ success: true });
});

export default router;
