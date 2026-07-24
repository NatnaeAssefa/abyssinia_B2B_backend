# Abyssinia B2B Backend — API Endpoint Reference

> Generated from route definitions in `src/routes/`. Use this when wiring the **abyssinia-trade-hub** frontend.
>
> **Base URL:** `http://localhost:3000` (or `BACKEND_URL` from `.env`) — no global `/api` prefix.

---

## Table of contents

1. [Conventions](#conventions)
2. [Health & system](#health--system)
3. [Static assets](#static-assets)
4. [Authentication](#authentication)
5. [Users & RBAC](#users--rbac)
6. [System (files, configs, notifications)](#system-files-configs-notifications)
7. [Marketplace](#marketplace)
8. [Entity field reference](#entity-field-reference)
9. [Known quirks](#known-quirks)

---

## Conventions

### Response envelope

Most JSON endpoints use `ServerResponse`:

| Field | Success (2xx) | Error (4xx/5xx) |
|-------|---------------|-----------------|
| `status` | HTTP status code | HTTP status code |
| `message` | Human-readable string | Human-readable string |
| `data` | Payload | *(omitted)* |
| `error` | *(omitted)* | Error details |

Legacy endpoints in `src/routes/index.ts` (`GET /`) use `{ status, data, message }` without `error`.

### Authorization header

Protected routes expect:

```http
Authorization: Bearer <JWT>
```

JWT is issued on login / OAuth. The server checks `user.last_used_key` matches the token payload `key` (revoked tokens return **401**).

### Role-based access (`AuthorizeAccess`)

After authentication, some routes require the user’s role to include specific **access rule** strings (e.g. `read_user`). Users with `role_id === BASE_ROLE_ID` bypass rule checks. **Super admins** (`user.type === SUPER_ADMIN`) skip row-level scoping in services.

### List / filter query string (`?query=...`)

`GET` list and detail endpoints (except some auth routes) accept a URL-encoded `query` parameter parsed by `ParseQuery` (`src/utilities/pagination/Pagination.ts`).

Pass nested structures using bracket notation, e.g. `filter[0][key]=name&filter[0][operator]=ilike&filter[0][value]=coffee`.

Supported fragments inside `query` (when enabled for that handler):

| Key | Purpose |
|-----|---------|
| `filter` | Array of `{ key, operator, value }` — operators: `=`, `!=`, `ilike`, `like`, `between`, `>`, `>=`, `<`, `<=`, `in`, `notin`, `or`, `and` |
| `include` | Sequelize includes `{ model, alias?, required?, filter?, include? }` |
| `offset` / `limit` | Pagination (default limit **10**, max **100**; `limit=-1` → 100000) |
| `order` | Array of `{ key, value: "ASC"\|"DESC", literal? }` |
| `search` | `{ keys: string[], value: string }` — OR ilike across keys |
| `paranoid` | Soft-delete scope (`paranoid=false` includes deleted rows if user has `access_paranoid`) |

**Example — list products page 2:**

```http
GET /product/?query=offset=20&limit=10&filter[0][key]=is_active&filter[0][operator]==&filter[0][value]=true:b
```

Type suffix on values: `:b` boolean, `:n` number, `:s` string (default).

### Standard CRUD body shapes

Most resource controllers share these patterns:

| Method | Path suffix | Body |
|--------|-------------|------|
| `PUT` | `/` | `{ id: UUID, ...fields }` |
| `PATCH` | `/restore` | `{ id: UUID }` |
| `DELETE` | `/` | `{ id: UUID, force?: boolean }` |

`POST /` body fields are validated per controller (often copied from a template — **verify against Sequelize models** in `src/models/`).

### Soft delete

Models use Sequelize `paranoid`. `DELETE` soft-deletes unless `force: true`. `PATCH .../restore` restores.

---

## Health & system

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | API info: `{ name: "Read-Sea API", version: "1.0.0" }` |
| `GET` | `/system/init/748596123852` | No | One-time DB seed / init via `SystemService.initSystem()`. Returns **404** if already initialized. |
| `GET` | `/loaderio-/` | No | Downloads loader.io verification file (server path). |
| `GET` | `/api-docs` | No | Swagger UI (only if `SWAGGER_ENABLED=true`) |

---

## Static assets

| Path | Description |
|------|-------------|
| `/uploads/*` | Uploaded files |
| `/profiles/*` | Profile images |
| `/public/*` | Public static files |

---

## Authentication

| Method | Path | Auth | Body / query | Notes |
|--------|------|------|--------------|-------|
| `POST` | `/auth/login` | No | `{ email, password }` | Email or phone as `email`. Returns user + token on success. |
| `GET` | `/auth` | Yes | — | Current user (`getMe`). |
| `POST` | `/auth/register` | No | See [Register](#register-body) | Creates user; verification email flow. |
| `POST` | `/auth/forgot_password` | No | `{ email }` | Sends recovery email. |
| `GET` | `/auth/verify` | No | `?email=&code=` | Email verification (renders Pug view). |
| `GET` | `/auth/recover` | No | `?email=&code=` | Password recovery form (Pug view). |
| `POST` | `/auth/recover-input` | No | `{ email, code, password, confirm_password }` | Set new password after recovery. |
| `POST` | `/auth/change_password` | Yes | `{ previous_password, new_password }` | Logged-in password change. |
| `POST` | `/auth/callback` | No | `{ code }` | Google OAuth code exchange → token. |
| `POST` | `/auth/callback/facebook` | Passport | Facebook token strategy | Facebook login. |

### Register body

```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone_number": "+251911234567",
  "whatsapp_number": "+251911234567",
  "password": "string",
  "code": "optional referral",
  "role_id": "optional UUID",
  "preferred_contact_method": "EMAIL | PHONE | WHATSAPP"
}
```

---

## Users & RBAC

### Mount prefixes

| Prefix | Router file |
|--------|-------------|
| `/users` | `User.routes.ts` |
| `/roles` | `Role.routes.ts` |
| `/access_rules` | `AccessRule.routes.ts` |
| `/action_logs` | `ActionLog.routes.ts` |
| `/user_profiles` | `UserProfile.routes.ts` |

---

### `/users`

| Method | Path | Auth | Access rule | Description |
|--------|------|------|-------------|-------------|
| `GET` | `/users/get` | Yes | `read_user` | Single user by `?query=` filters |
| `GET` | `/users/:id` | Yes | `read_user` | User by UUID |
| `GET` | `/users/` | Yes | `read_user` | List users (paginated `query`) |
| `POST` | `/users/` | Yes | `write_user` | Admin create user |
| `PUT` | `/users/` | Yes | *(none)* | Update user |
| `PUT` | `/users/me` | Yes | — | Update own profile |
| `PATCH` | `/users/revoke_token` | Yes | `revoke_user_token` | Invalidate JWT |
| `PATCH` | `/users/change_password` | Yes | `change_user_password` | Admin change another user’s password |
| `PATCH` | `/users/restore` | Yes | `write_user` | Restore soft-deleted user |
| `DELETE` | `/users/` | Yes | `delete_user` | Soft/hard delete `{ id, force? }` |
| `POST` | `/users/verify` | Yes | — | Toggle `is_verified` |
| `POST` | `/users/filter` | Yes | — | Advanced user filter (body-driven) |

---

### `/roles`

| Method | Path | Auth | Access rule | Description |
|--------|------|------|-------------|-------------|
| `GET` | `/roles/selected-roles` | **No** | — | Public subset of roles (registration UI) |
| `GET` | `/roles/` | **No** | — | List all roles |
| `GET` | `/roles/get` | Yes | `read_role` | One role by query |
| `GET` | `/roles/:id` | Yes | `read_role` | Role by id |
| `POST` | `/roles/` | Yes | `write_role` | Create |
| `PUT` | `/roles/` | Yes | `write_role` | Update |
| `PATCH` | `/roles/restore` | Yes | `write_role` | Restore |
| `DELETE` | `/roles/` | Yes | `delete_role` | Delete |

---

### `/access_rules`

| Method | Path | Auth | Access rule |
|--------|------|------|-------------|
| `GET` | `/access_rules/get` | Yes | `read_access_rule` |
| `GET` | `/access_rules/:id` | Yes | `read_access_rule` |
| `GET` | `/access_rules/` | Yes | `read_access_rule` |
| `POST` | `/access_rules/` | Yes | `write_access_rule` |
| `PUT` | `/access_rules/` | Yes | `write_access_rule` |
| `PATCH` | `/access_rules/restore` | Yes | `write_access_rule` |
| `DELETE` | `/access_rules/` | Yes | `delete_access_rule` |

---

### `/action_logs`

| Method | Path | Auth | Access rule |
|--------|------|------|-------------|
| `GET` | `/action_logs/get` | Yes | `read_action_log` |
| `GET` | `/action_logs/:id` | Yes | `read_action_log` |
| `GET` | `/action_logs/` | Yes | *(commented out)* |
| `POST` | `/action_logs/` | Yes | `write_action_log` |
| `PUT` | `/action_logs/` | Yes | `write_action_log` |
| `PATCH` | `/action_logs/restore` | Yes | `write_action_log` |
| `DELETE` | `/action_logs/` | Yes | `delete_action_log` |

---

### `/user_profiles`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/user_profiles/get` | Yes | One profile by query |
| `GET` | `/user_profiles/profile` | Yes | **Current user’s** profile |
| `GET` | `/user_profiles/:id` | Yes | By id |
| `GET` | `/user_profiles/` | Yes | List |
| `POST` | `/user_profiles/` | Yes | Create |
| `PUT` | `/user_profiles/` | Yes | Update `{ id, ... }` |
| `PATCH` | `/user_profiles/restore` | Yes | Restore |
| `DELETE` | `/user_profiles/` | Yes | Delete |

---

## System (files, configs, notifications)

### `/files`

| Method | Path | Auth | Access rule | Description |
|--------|------|------|-------------|-------------|
| `POST` | `/files/upload-url` | Yes | — | `{ file_url: string }` — fetch & store remote file |
| `POST` | `/files/single` | Yes | — | `multipart/form-data`, field **`file`** |
| `POST` | `/files/multiple` | Yes | — | `multipart/form-data`, field **`files`** (array) |
| `POST` | `/files/path` | Yes | `write_file` | Create file record with path metadata (body) |
| `GET` | `/files/get` | Yes | `read_file` | One file by query |
| `GET` | `/files/:id` | Yes | `read_file` | By id |
| `GET` | `/files/` | Yes | — | List |
| `PUT` | `/files/` | Yes | `write_file` | Update |
| `PATCH` | `/files/restore` | Yes | `write_file` | Restore |
| `DELETE` | `/files/` | Yes | `delete_file` | Delete |

---

### `/configs`

| Method | Path | Auth | Access rule |
|--------|------|------|-------------|
| `GET` | `/configs/get` | Yes | `read_config` |
| `GET` | `/configs/:id` | Yes | `read_config` |
| `GET` | `/configs/` | Yes | `read_config` |
| `POST` | `/configs/` | Yes | `write_config` |
| `PUT` | `/configs/` | Yes | `write_config` |
| `PATCH` | `/configs/restore` | Yes | `write_config` |
| `DELETE` | `/configs/` | Yes | `delete_config` |

---

### `/notification`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/notification/filter` | Yes | Classified notifications (body filter) |
| `GET` | `/notification/my` | Yes | Current user’s notifications |
| `GET` | `/notification/get` | Yes | One by query |
| `GET` | `/notification/:id` | Yes | By id |
| `GET` | `/notification/` | Yes | List |
| `POST` | `/notification/` | Yes | Create |
| `PUT` | `/notification/` | Yes | Update |
| `PATCH` | `/notification/restore` | Yes | Restore |
| `DELETE` | `/notification/` | Yes | Delete |

---

## Marketplace

Mount map (`src/routes/MarketPlace/index.ts`):

| Base path | Resource |
|-----------|----------|
| `/address` | Shipping/billing addresses |
| `/blog-post` | Blog posts |
| `/cart` | Shopping carts |
| `/cart-item` | Cart line items |
| `/category` | Product categories |
| `/newsletter-subscription` | Newsletter emails |
| `/product` | Products |
| `/product-image` | Product images |
| `/product-incoterm` | Incoterms per product |
| `/product-specification` | Spec rows |
| `/product-target-market` | Target markets |
| `/product-use-case` | Use cases |
| `/product-view` | View analytics |
| `/quote-request` | RFQ / quotes |
| `/recently-viewed` | User browse history |
| `/subcategory` | Subcategories |
| `/supplier` | Suppliers |

Each resource below uses base `/{resource}` unless noted.

### Auth matrix legend

- **Public** — no `Authorization` header
- **Auth** — `AuthenticateUser` only
- **Auth + rule** — JWT + `AuthorizeAccess([...])`

---

### Standard 7-endpoint resources

These share the same path suffixes; auth differs (see tables).

| Suffix | Method | Typical purpose |
|--------|--------|-----------------|
| `/get` | `GET` | Fetch one record matching `?query=` |
| `/:id` | `GET` | Fetch by UUID (+ optional `?query=` includes) |
| `/` | `GET` | List / paginate |
| `/` | `POST` | Create |
| `/` | `PUT` | Update `{ id, ... }` |
| `/restore` | `PATCH` | Restore soft-deleted |
| `/` | `DELETE` | Delete `{ id, force? }` |

#### `/product` — B2B catalog (primary storefront API)

| Endpoint | Auth |
|----------|------|
| `GET /product/get`, `GET /product/:id`, `GET /product/` | **Public** |
| `POST`, `PUT`, `PATCH /restore`, `DELETE` | Auth + `write_action_log` / `delete_action_log` |

`GET /product/` auto-includes `product_images` association.

#### `/category`, `/supplier`, `/address`, `/blog-post`, `/newsletter-subscription`

| Reads | Writes |
|-------|--------|
| **Public** (`GET /get`, `/:id`, `/`) | Auth + `write_access_rule` / `delete_access_rule` |

#### `/cart`

| Endpoint | Auth |
|----------|------|
| All `GET` | Auth + `read_access_rule` |
| `POST`, `PUT`, `PATCH /restore` | Auth + `write_access_rule` |
| `DELETE` | Auth + `delete_access_rule` |

#### `/cart-item`

| Endpoint | Auth |
|----------|------|
| `GET /get`, `GET /:id` | Auth + `read_action_log` |
| `GET /` | Auth only |
| Mutations | Auth + `write_action_log` / `delete_action_log` |

#### `/subcategory`

| Reads | Writes |
|-------|--------|
| **Public** | **Auth** only (no `AuthorizeAccess`) |

#### `/product-image`, `/product-specification`, `/product-use-case`

| Reads | Writes |
|-------|--------|
| `GET /get`, `GET /:id` — **Public**; `GET /` — Auth + `read_role` | Auth + `write_role` / `delete_role` |

#### `/product-incoterm`, `/product-target-market`

| Reads | Writes |
|-------|--------|
| `GET /get`, `GET /:id` — Auth + `read_role`; `GET /` — Auth only | Auth + `write_role` / `delete_role` |

#### `/product-view`

Same pattern as `/product` (public reads, `write_action_log` / `delete_action_log` on mutations).

---

### `/quote-request` and `/recently-viewed`

Standard CRUD **plus**:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `.../profile` | Yes | Current user’s quote requests / recently viewed |

All other routes: **Auth** only (no `AuthorizeAccess` on these routers).

**Quote request model fields:** `product_id`, `user_id?`, `quantity`, `packaging?`, `destination?`, `incoterm?`, `name?`, `email`, `company?`, `phone?`, `notes?`, `status` (`PENDING` | `IN_PROGRESS` | `QUOTED` | `ACCEPTED` | `REJECTED` | `CANCELLED`).

---

## Entity field reference

Use Sequelize models in `src/models/` as the source of truth for create/update payloads.

### `Product`

`name`, `slug`, `description`, `short_description`, `category_id`, `subcategory_id`, `supplier_id`, `origin`, `grade`, `purity`, `moisture`, `form`, `packaging`, `moq`, `availability`, `price`, `currency`, `is_featured`, `is_active`, `in_stock`, `meta_title`, `meta_description`, `view_count`

### `Category` / `Subcategory`

Hierarchy: category → subcategory → product. See model files for slug, name, image, sort order, etc.

### `Supplier`

Company/supplier metadata for product listings.

### `Cart` / `CartItem`

Cart per user/session; line items reference `product_id`, quantities, etc.

### `User` (admin API)

`email`, `phone_number`, `first_name`, `last_name`, `status`, `type`, `role_id`, `is_verified`, preferences (`pref_language`, `pref_currency`, `pref_unit`), …

### `UserProfile`

Extended profile fields linked to `user_id` — use `GET /user_profiles/profile` for the logged-in user.

### `File`

Stored file metadata; uploads return paths under `/uploads` or similar.

### `Notification`

User notifications — prefer `GET /notification/my` and `POST /notification/filter` for inbox UIs.

---

## Known quirks

1. **Misnamed access rules on marketplace routes** — Many marketplace `POST`/`PUT`/`DELETE` handlers still reference `write_action_log`, `write_access_rule`, or `write_role` from copy-pasted route templates. Frontend must send a JWT whose role includes those rules, or calls return **403**, even for public catalog data mutations.

2. **Controller Joi schemas vs models** — Several controllers (e.g. `Product.controller.ts`) still validate against ActionLog-shaped bodies (`action`, `object`, `prev_data`, `new_data`). Services may accept model fields anyway; prefer model definitions and integration tests over route Joi when in doubt.

3. **`GET /roles/` is public** — Full role list including access rules may be exposed; treat accordingly in admin UI.

4. **Two response formats** — `GET /` root vs `ServerResponse` elsewhere (`error` vs `data`).

5. **Route order** — On routers with `GET /profile` and `GET /:id`, always call `/profile` before parameterized ids (already ordered correctly in code).

6. **Facebook auth route** — Uses `passport.authenticate("code")`; verify strategy name matches deployment config.

---

## Quick endpoint count

| Area | ~Endpoints |
|------|------------|
| Health / init | 3 |
| Auth | 10 |
| Users & RBAC | 43 |
| System | 27 |
| Marketplace (17 resources × ~7 + extras) | ~125 |
| **Total HTTP routes** | **~210** |

---

## Frontend integration checklist

- [ ] Store JWT from `POST /auth/login` or OAuth callbacks; send as `Bearer` token
- [ ] Use `VITE_API_URL` (or equivalent) pointing at backend origin **without** `/api` suffix
- [ ] Public catalog: `GET /product/`, `/category/`, `/subcategory/`, `/supplier/` with `?query=` pagination
- [ ] Logged-in buyer: `GET /cart/`, `/cart-item/`, `/quote-request/profile`, `/recently-viewed/profile`
- [ ] RFQ form: `POST /quote-request/` (authenticated)
- [ ] Newsletter: `POST /newsletter-subscription/` (check auth on route before exposing publicly)
- [ ] Media: `POST /files/single` then reference returned URL
- [ ] Admin: ensure role has required access rules for mutating routes

*Last updated from codebase scan — May 2026.*
