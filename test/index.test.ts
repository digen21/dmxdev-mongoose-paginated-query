import sinon from 'sinon';
import mongoosePaginate from '../src/index';

describe('mongoosePaginate', () => {
  let mockSchema: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    mockQueryBuilder = {
      skip: sinon.stub().returnsThis(),
      limit: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      populate: sinon.stub().returnsThis(),
      select: sinon.stub().returnsThis(),
      lean: sinon.stub().returnsThis(),
      exec: sinon.stub(),
    };

    mockSchema = {
      find: sinon.stub().returns(mockQueryBuilder),
      countDocuments: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should perform basic pagination', async () => {
    const mockDocs = [{ id: 1 }, { id: 2 }];
    mockQueryBuilder.exec.resolves(mockDocs);
    mockSchema.countDocuments.resolves(2);

    const result = await mongoosePaginate({
      schema: mockSchema as any,
      options: { page: 1, limit: 2 },
    });

    expect(result.docs).toEqual(mockDocs);
    expect(result.totalDocs).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });

  it('should handle custom query filters', async () => {
    const mockDocs = [{ id: 1, status: 'active' }];
    mockQueryBuilder.exec.resolves(mockDocs);
    mockSchema.countDocuments.resolves(1);

    const result = await mongoosePaginate({
      schema: mockSchema as any,
      options: { page: 1, limit: 10 },
      query: { status: 'active' },
    });

    expect(result.docs).toEqual(mockDocs);
    expect(result.totalDocs).toBe(1);
  });

  it('should handle population of references', async () => {
    const mockDocs = [{ id: 1, ref: { id: 'ref1' } }];
    mockQueryBuilder.exec.resolves(mockDocs);
    mockSchema.countDocuments.resolves(1);

    const populateOptions = { path: 'ref', select: 'id' };

    await mongoosePaginate({
      schema: mockSchema as any,
      options: { page: 1, limit: 10 },
      populate: populateOptions,
    });

    expect(mockQueryBuilder.populate.calledWith(populateOptions)).toBe(true);
  });

  it('should handle field selection', async () => {
    const mockDocs = [{ id: 1, name: 'test' }];
    mockQueryBuilder.exec.resolves(mockDocs);
    mockSchema.countDocuments.resolves(1);

    await mongoosePaginate({
      schema: mockSchema as any,
      options: { page: 1, limit: 10 },
      select: 'name',
    });

    expect(mockQueryBuilder.select.calledWith('name')).toBe(true);
  });

  it('should handle empty results', async () => {
    mockQueryBuilder.exec.resolves([]);
    mockSchema.countDocuments.resolves(0);

    const result = await mongoosePaginate({
      schema: mockSchema as any,
      options: { page: 1, limit: 10 },
    });

    expect(result.docs).toEqual([]);
    expect(result.totalDocs).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    mockQueryBuilder.exec.rejects(new Error('Database error'));

    await expect(
      mongoosePaginate({
        schema: mockSchema as any,
        options: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow('Error during pagination: Database error');
  });
});
