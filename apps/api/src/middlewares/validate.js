import { AppError } from '../utils/errors.js';

/**
 * Handlers read only from req.valid, so a field that isn't in a schema can never
 * reach a query. Unknown body fields are dropped, which also prevents mass assignment.
 */
export function validate(schemas) {
  return (req, _res, next) => {
    req.valid = {};
    for (const [source, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[source]);
      if (!result.success) throw new AppError(result.error.issues[0].message, 400);
      req.valid[source] = result.data;
    }
    next();
  };
}
