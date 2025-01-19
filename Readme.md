# Mongoose Paginate

A simple and type-safe pagination utility for Mongoose.

## Installation

```bash
npm install @dmxdev/mongoose-paginated-query
```

## Usage

### Basic Usage

```typescript
import mongoosePaginate from '@dmxdev/mongoose-paginated-query';

const result = await mongoosePaginate({
  schema: YourModel,
  options: {
    page: 1,
    limit: 10,
    sort: { createdAt: -1 },
  },
  query: { status: 'active' },
  populate: [{ path: 'author', select: 'name' }],
  select: 'title content',
});
```

### Types

```typescript
interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, any>;
}

interface MongoosePaginateParams<T> {
  schema: Model<T>;
  options: PaginationOptions;
  query?: Record<string, any>;
  populate?: PopulateInput;
  select?: string;
}

interface PaginationResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### Population Options

The `populate` parameter supports complex population scenarios:

```typescript
const populate = [
  {
    path: 'author',
    select: 'name email',
    populate: {
      path: 'profile',
      select: 'avatar',
    },
  },
];

const result = await mongoosePaginate({
  schema: YourModel,
  options: { page: 1, limit: 10 },
  populate,
});
```

## Features

- Type-safe pagination
- Flexible population options
- Field selection support
- Sorting capabilities
- Automatic total pages calculation
- Previous/Next page indicators

## License

MIT
