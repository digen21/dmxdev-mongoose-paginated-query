import mongoosePaginate, {
  PaginationOptions,
  PaginationResult,
} from '../src/index';

const mockSchema = {
  find: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn(),
  countDocuments: jest.fn().mockReturnThis(),
};

describe('mongoosePaginate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated results', async () => {
    const docs = [{ name: 'doc1' }, { name: 'doc2' }];
    const totalDocs = 20;

    mockSchema.exec.mockResolvedValueOnce(docs);
    mockSchema.countDocuments.mockResolvedValueOnce(totalDocs);

    const options: PaginationOptions = {
      page: 1,
      limit: 2,
      sort: { name: 1 },
      populate: [],
    };

    const query = {};
    const result: PaginationResult<(typeof docs)[0]> = await mongoosePaginate(
      mockSchema as any,
      options,
      query,
    );

    expect(mockSchema.find).toHaveBeenCalledWith(query);
    expect(mockSchema.skip).toHaveBeenCalledWith(0);
    expect(mockSchema.limit).toHaveBeenCalledWith(2);
    expect(mockSchema.sort).toHaveBeenCalledWith({ name: 1 });
    expect(mockSchema.populate).toHaveBeenCalledWith([]);
    expect(mockSchema.lean).toHaveBeenCalled();
    expect(mockSchema.exec).toHaveBeenCalledTimes(1);
    expect(mockSchema.countDocuments).toHaveBeenCalledWith({});
    expect(result).toEqual({
      docs,
      totalDocs,
      limit: 2,
      page: 1,
      totalPages: 10,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  it('should handle custom query', async () => {
    const docs = [{ name: 'doc1' }];
    const totalDocs = 1;

    mockSchema.exec.mockResolvedValueOnce(docs);
    mockSchema.countDocuments.mockResolvedValueOnce(totalDocs);

    const options: PaginationOptions = {
      page: 1,
      limit: 1,
      sort: { name: 1 },
      populate: [],
    };

    const query = { name: 'doc1' };

    const result: PaginationResult<(typeof docs)[0]> = await mongoosePaginate(
      mockSchema as any,
      options,
      query,
    );

    expect(mockSchema.find).toHaveBeenCalledWith(query);
    expect(mockSchema.skip).toHaveBeenCalledWith(0);
    expect(mockSchema.limit).toHaveBeenCalledWith(1);
    expect(mockSchema.sort).toHaveBeenCalledWith({ name: 1 });
    expect(mockSchema.populate).toHaveBeenCalledWith([]);
    expect(mockSchema.lean).toHaveBeenCalled();
    expect(mockSchema.exec).toHaveBeenCalledTimes(1);
    expect(mockSchema.countDocuments).toHaveBeenCalledWith(query);
    expect(result).toEqual({
      docs,
      totalDocs,
      limit: 1,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
  });
});
