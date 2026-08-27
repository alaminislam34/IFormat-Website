import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    message = "Operation completed successfully",
    data?: T,
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...(data !== undefined ? { data } : {}),
    });
  }

  static collection<T>(
    res: Response,
    message = "Data retrieved successfully",
    data: T[],
    meta: PaginationMeta,
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static error(
    res: Response,
    message = "An error occurred",
    statusCode = 500,
    errors?: any,
    requestId?: string
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(requestId ? { requestId } : {}),
      ...(errors !== undefined ? { errors } : {}),
    });
  }
}
