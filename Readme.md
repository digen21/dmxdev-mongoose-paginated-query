````markdown
# Mongoose Paginate

This package provides a function to paginate Mongoose model queries.

## Installation

To install the package, run:

```bash
npm install @dmxdev/mongoose-paginated-query
```
````

## Usage

### Importing the Function

First, import the `mongoosePaginate` function:

```typescript
import mongoosePaginate, {
  PaginationOptions,
  PaginationResult,
} from '@dmxdev/mongoose-paginated-query';
```

### Defining the Schema

Define your Mongoose schema and model:

```typescript
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: String,
  email: String,
});

const User = model('User', userSchema);
```

### Using the `mongoosePaginate` Function

Use the `mongoosePaginate` function to paginate your queries:

```typescript
const options: PaginationOptions = {
  page: 1,
  limit: 10,
  sort: { name: 1 },
  populate: [],
};

const query = { name: 'John Doe' };

mongoosePaginate(User, options, query)
  .then((result: PaginationResult<typeof User>) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error);
  });
```

**Explanation:**

- `mongoosePaginate(Model, options, query)`: This is the core function.
  - `Model`: The Mongoose model you want to paginate (e.g., `User`).
  - `options`: An object containing pagination options:
    - `page`: The current page number (default: 1).
    - `limit`: The number of documents per page (default: 10).
    - `sort`: An object specifying the sorting order (e.g., `{ createdAt: -1 }` for descending order).
    - `populate`: An array of options for populating referenced documents (optional).
  - `query`: The query conditions for filtering documents.

**Pagination Result:**

The `mongoosePaginate` function returns a `PaginationResult` object with the following properties:

- `docs`: An array of paginated documents.
- `totalDocs`: The total number of documents matching the query.
- `limit`: The number of documents per page.
- `page`: The current page number.
- `totalPages`: The total number of pages.
- `hasNextPage`: `true` if there is a next page, `false` otherwise.
- `hasPrevPage`: `true` if there is a previous page, `false` otherwise.

## Example

```typescript
import mongoosePaginate, {
  PaginationOptions,
  PaginationResult,
} from '@dmxdev/mongoose-paginated-query';
import { Schema, model, connect } from 'mongoose';

const userSchema = new Schema({
  name: String,
  email: String,
});

const User = model('User', userSchema);

const run = async () => {
  await connect('mongodb://localhost:27017/mydatabase');

  const options: PaginationOptions = {
    page: 1,
    limit: 10,
    sort: { name: 1 },
    populate: [],
  };

  const query = { name: 'John Doe' };

  try {
    const result: PaginationResult<typeof User> = await mongoosePaginate(
      User,
      options,
      query,
    );
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

run();
```

## Benefits

- **Simplified Pagination:** Easily paginate Mongoose queries with a single function.
- **Flexibility:** Customize pagination options to fit your specific needs.
- **Type Safety:** Utilizes TypeScript interfaces for better code maintainability.
- **Improved Code Readability:** Encapsulates pagination logic for cleaner code.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
