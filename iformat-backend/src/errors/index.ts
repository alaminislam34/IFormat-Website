import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors?: any) {
    super(message, 400, errors);
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required or invalid credentials", errors?: any) {
    super(message, 401, errors);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action", errors?: any) {
    super(message, 403, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", id?: string | number, errors?: any) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, 404, errors);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists or violates a unique constraint", errors?: any) {
    super(message, 409, errors);
  }
}

export * from "./AppError.js";
