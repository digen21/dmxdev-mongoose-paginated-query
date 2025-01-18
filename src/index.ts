import { Model } from 'mongoose';

/**
 * Options for populating documents in Mongoose.
 *
 * @typedef {Object} PopulateOptions
 * @property {string} path - The path of the field to populate.
 * @property {string | Record<string, number>} [select] - Fields to include or exclude in the populated documents.
 * @property {Record<string, unknown>} [match] - Conditions to match documents for population.
 * @property {Object} [options] - Additional options for population.
 * @property {Record<string, 1 | -1>} [options.sort] - Sort order for the populated documents.
 * @property {number} [options.limit] - Limit the number of populated documents.
 * @property {number} [options.skip] - Skip the specified number of populated documents.
 * @property {string} [localField] - The local field to match with the foreign field.
 * @property {string} [foreignField] - The foreign field to match with the local field.
 * @property {PopulateOptions | PopulateOptions[]} [populate] - Nested population options.
 */
export type PopulateOptions = {
  path: string;
  select?: string | Record<string, number>;
  match?: Record<string, unknown>;
  options?: {
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
  };
  localField?: string;
  foreignField?: string;
  populate?: PopulateOptions | PopulateOptions[];
};

export type PopulateArray = PopulateOptions[];
/**
 * Represents the input type for population in Mongoose pagination.
 *
 * This can be one of the following types:
 * - `string`: A string representing the path to populate.
 * - `PopulateOptions`: An object containing options for population.
 * - `PopulateArray`: An array of paths or options for population.
 */
export type PopulateInput = PopulateOptions | PopulateOptions[];

/**
 * Interface representing the options for pagination.
 *
 * @property {number} page - The current page number.
 * @property {number} limit - The number of items per page.
 * @property {Record<string, any>} [sort] - Optional sorting criteria.
 * @property {PopulateInput} [populate] - Optional population criteria.
 */
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
 * Options for pagination.
 *
 * @property {number} page - The page number to retrieve.
 * @property {number} limit - The number of items per page.
 * @property {Record<string, any>} [sort] - Optional sorting criteria.
 * @property {PopulateOptions[]} [populate] - Optional population options for related documents.
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, any>;
}

export interface PaginateParams {
  options: PaginationOptions; // Pagination options
  query?: Record<string, any>; // Optional query to filter results
  populate?: PopulateInput; // Optional populate input
  select?: string; // Optional fields to select
}

export interface MongoosePaginateParams<T> {
  schema: Model<T>; // The Mongoose model
  options: PaginationOptions; // Pagination options
  query?: Record<string, any>; // Optional query to filter results
  populate?: PopulateInput; // Optional populate input
  select?: string; // Optional fields to select
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

const mongoosePaginate = async <T>({
  schema,
  options,
  query = {},
  populate,
  select,
}: MongoosePaginateParams<T>): Promise<PaginationResult<T>> => {
  const { page = 1, limit = 10, sort = {} } = options;

  const skip = (page - 1) * limit;

  /**
   * Executes a paginated query on a MongoDB schema using Mongoose.
   *
   * @param schema - The Mongoose model/schema to query
   * @param query - The MongoDB query filter criteria
   * @param skip - Number of documents to skip
   * @param limit - Maximum number of documents to return
   * @param sort - Sort criteria for the query results
   * @param normalizedPopulate - Population options for referenced documents
   * @param select - Fields to include/exclude in the query results
   * @returns Promise containing a tuple of [documents array, total count]
   * @typeParam T - Type of the documents being queried
   */

  try {
    const [docs, totalDocs] = await Promise.all([
      schema
        .find(query) // Find documents matching the query
        .skip(skip) // Skip the specified number of documents
        .limit(limit) // Limit the number of documents returned
        .sort(sort) // Sort the documents
        .populate(populate!) // Populate referenced documents
        .select(select!) // Select specific fields
        .lean<T[]>() // Convert documents to plain JavaScript objects
        .exec(), // Execute the query
      schema.countDocuments(query), // Count the total number of documents matching the query
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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Error during pagination: ${errorMessage}`);
  }
};

export default mongoosePaginate;
