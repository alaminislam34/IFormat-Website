import { ApiErrorResponse } from "@/types/api";

export class ApiError extends Error {
  public statusCode: number;
  public errors?: any;
  public isNetworkError: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errors?: any,
    isNetworkError = false
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isNetworkError = isNetworkError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Extract key-value field errors from array or object formats
   */
  getFieldErrors(): Record<string, string> {
    const fieldMap: Record<string, string> = {};

    if (this.errors) {
      if (Array.isArray(this.errors)) {
        this.errors.forEach((err: any) => {
          if (err.field && err.message) {
            fieldMap[err.field] = err.message;
          }
        });
      } else if (typeof this.errors === "object") {
        Object.entries(this.errors).forEach(([field, msg]) => {
          if (Array.isArray(msg)) {
            fieldMap[field] = msg[0];
          } else if (typeof msg === "string") {
            fieldMap[field] = msg;
          }
        });
      }
    }

    // If no explicit field errors array was parsed, infer from common backend error messages
    if (Object.keys(fieldMap).length === 0 && this.message) {
      const msg = this.message.toLowerCase();
      if (msg.includes("email already exists") || msg.includes("already in use") || msg.includes("email address")) {
        fieldMap["email"] = this.message;
      } else if (msg.includes("invalid email or password") || msg.includes("invalid password") || msg.includes("password is incorrect")) {
        fieldMap["password"] = this.message;
      } else if (msg.includes("verification code") || msg.includes("otp")) {
        fieldMap["code"] = this.message;
      }
    }

    return fieldMap;
  }

  hasFieldErrors(): boolean {
    return Object.keys(this.getFieldErrors()).length > 0;
  }

  static fromResponse(data: ApiErrorResponse, statusCode: number): ApiError {
    return new ApiError(
      data.message || "An unexpected error occurred",
      statusCode,
      data.errors
    );
  }

  static networkError(message = "Unable to connect to the server. Please check your connection."): ApiError {
    return new ApiError(message, 0, undefined, true);
  }
}
