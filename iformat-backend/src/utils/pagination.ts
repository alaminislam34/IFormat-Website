import { PaginationMeta } from "./apiResponse.js";

export interface PaginationOptions {
  page?: number | string;
  limit?: number | string;
}

export const getPagination = (options: PaginationOptions, maxLimit = 100) => {
  const page = Math.max(1, parseInt(String(options.page || 1), 10) || 1);
  const rawLimit = parseInt(String(options.limit || 20), 10) || 20;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
