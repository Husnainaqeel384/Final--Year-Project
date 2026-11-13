/** An error whose message is safe to show to the user. Anything else is reported as a generic 500. */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Also used when a record exists but belongs to someone else, so its existence is not revealed. */
export const notFound = (what = 'Record') => new AppError(`${what} not found`, 404);
export const forbidden = (message = 'You do not have permission to do that') =>
  new AppError(message, 403);
