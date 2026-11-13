import multer from 'multer';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/errors.js';

export function notFoundHandler(_req, _res, next) {
  next(new AppError('Not found', 404));
}

export function errorHandler(err, req, res, _next) {
  let status = 500;
  let message = 'Something went wrong. Please try again.';

  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'That file is too large' : 'The upload could not be read';
  } else if (err.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'That already exists';
  } else if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    status = 400;
    message = 'The request could not be read';
  }

  // Details of unexpected failures go to the log, never to the client.
  if (status >= 500) (req.log ?? logger).error({ err }, 'Unhandled error');

  res.status(status).json({ success: false, message });
}
