import { Model } from 'mongoose';

interface Select {
  [key: string]: 1 | 0;
}

export interface PopulateOptions {
  path: string;
  select?: Select | string;
  populate?: PopulateOptions | PopulateOptions[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, any>;
  populate?: PopulateOptions[];
}

export interface PaginationResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginates a Mongoose model query.
 *
 * @template T - The type of the documents being queried.
 * @param {Model<T>} schema - The Mongoose model to query.
 * @param {PaginationOptions} options - The pagination options.
 * @param {Record<string, any>} [query] - The query conditions.
 * @returns {Promise<{
 *   docs: T[];
 *   totalDocs: number;
 *   limit: number;
 *   page: number;
 *   totalPages: number;
 *   hasNextPage: boolean;
 *   hasPrevPage: boolean;
 * }>} - An object containing the paginated results and pagination information.
 */
const mongoosePaginate = async <T>(
  schema: Model<T>,
  options: PaginationOptions,
  query: Record<string, any> = {},
): Promise<PaginationResult<T>> => {
  const { page = 1, limit = 10, sort = {}, populate = [] } = options;

  const skip = (page - 1) * limit;

  const [docs, totalDocs] = await Promise.all([
    schema
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .populate(populate)
      .lean<T[]>() // This helps TypeScript understand that docs is an array of the correct type, ensuring proper type inference.
      .exec(),
    schema.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalDocs / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    docs,
    totalDocs,
    limit,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

export default mongoosePaginate;
