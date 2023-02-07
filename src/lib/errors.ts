export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode = 500, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super(401, 'Unauthorized');
  }
}
