---
name: Build Admin Feature
overview: 'Build the Admin feature module with three endpoints: get all users (paginated, with role/status filters), update user status (suspend/activate), and view all orders (paginated, with status filter). The "Manage categories" item is already covered by the existing categories module.'
todos:
  - id: admin-service
    content: Create src/modules/admin/admin.service.ts with getAllUsers (paginated, search, role/status filters), updateUserStatus, getAllOrders (paginated, status filter)
    status: pending
  - id: admin-validation
    content: Create src/modules/admin/admin.validation.ts with getUsersQuerySchema, userParamsSchema, updateUserStatusSchema, getAdminOrdersQuerySchema
    status: pending
  - id: admin-controller
    content: Create src/modules/admin/admin.controller.ts with three handlers
    status: pending
  - id: admin-router
    content: Create src/modules/admin/admin.router.ts with all ADMIN routes
    status: pending
  - id: register-admin-router
    content: Update src/app.ts to register adminRouter at /api/admin
    status: pending
  - id: update-features-admin
    content: Move Admin items to Done section in docs/features.md
    status: pending
isProject: false
---

# Build Admin Feature Module

## Context

The last unchecked feature group in [features.md](api/docs/features.md) is **Admin**:

- Get all users
- Update user status (suspend / activate)
- View all orders
- Manage categories (already done -- CRUD in the categories module with ADMIN auth)

The `User` model in [auth.prisma](api/code/prisma/schema/auth.prisma) has a `status` field (String, default "ACTIVE"). The API endpoints table specifies:

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| GET    | /api/admin/users     | Get all users      |
| PATCH  | /api/admin/users/:id | Update user status |

View all orders is not in the endpoint table but is listed as a feature. It will be added as `GET /api/admin/orders`.

## Module Structure

```
src/modules/admin/
  admin.router.ts
  admin.controller.ts
  admin.service.ts
  admin.validation.ts
```

## API Endpoints (ADMIN role)

### 1. GET /api/admin/users -- Get all users

- **Auth**: ADMIN only
- **Query**: `page`, `limit`, `sortBy` (createdAt, name), `sortOrder`, `search` (name/email), `role` (optional: CUSTOMER, PROVIDER, ADMIN), `status` (optional: ACTIVE, SUSPENDED)
- **Logic**: Paginated list of all users with safe field selection (exclude sessions, accounts, passwords). Include `providerProfile` for providers.
- **Response**: 200, `{ success, message, data, meta }`

### 2. PATCH /api/admin/users/:id -- Update user status

- **Auth**: ADMIN only
- **Body**: `status` (required, oneOf: ACTIVE, SUSPENDED)
- **Params**: `id`
- **Logic**: Find user by ID, throw 404 if not found. Update `status` field. Return updated user.
- **Response**: 200, `{ success, message, data }`

### 3. GET /api/admin/orders -- View all orders

- **Auth**: ADMIN only
- **Query**: `page`, `limit`, `sortBy` (createdAt), `sortOrder`, `status` (optional order status filter)
- **Logic**: Paginated list of all orders. Include user (name, image), provider (businessName, user name/image), and item count.
- **Response**: 200, `{ success, message, data, meta }`

## Implementation Details

### admin.validation.ts

- `getUsersQuerySchema` -- optional `page`, `limit`, `sortBy` (oneOf: createdAt, name), `sortOrder`, `search`, `role` (oneOf: CUSTOMER, PROVIDER, ADMIN), `status` (oneOf: ACTIVE, SUSPENDED)
- `userParamsSchema` -- `id` required string
- `updateUserStatusSchema` -- body: `status` required, oneOf ACTIVE/SUSPENDED
- `getAdminOrdersQuerySchema` -- optional `page`, `limit`, `sortBy` (oneOf: createdAt), `sortOrder`, `status` (oneOf: PLACED, PREPARING, READY, DELIVERED, CANCELLED)

### admin.service.ts

- `getAllUsers(query)` -- paginated with optional `search` (name OR email), `role`, and `status` filters; uses [paginationSortingHelper](api/code/src/helpers/paginationSortingHelper.ts); selects safe user fields (reuse pattern from [user.service.ts](api/code/src/modules/user/user.service.ts))
- `updateUserStatus(userId, status)` -- finds user, throws 404, updates status
- `getAllOrders(query)` -- paginated with optional `status` filter; includes user (name, image), provider (with user name/image), item count

### admin.controller.ts

Three handlers: `getAllUsers`, `updateUserStatus`, `getAllOrders`

### admin.router.ts

```
GET    /users      -> auth(ADMIN) -> validate({ query }) -> getAllUsers
PATCH  /users/:id  -> auth(ADMIN) -> validate({ params, body }) -> updateUserStatus
GET    /orders     -> auth(ADMIN) -> validate({ query }) -> getAllOrders
```

### [app.ts](api/code/src/app.ts) modification

```typescript
import { adminRouter } from "./modules/admin/admin.router";
app.use("/api/admin", adminRouter);
```

### After completion

- Move Admin items to the Done section in [features.md](api/docs/features.md)
- This completes all API features for the FoodHub project
