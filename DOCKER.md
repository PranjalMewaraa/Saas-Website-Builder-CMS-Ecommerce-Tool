# Docker Setup

This repo is packaged for local testing with:

- `admin` on `http://localhost:3000`
- `storefront` on `http://localhost:3002`
- `mysql` in Docker
- `mongo` from Atlas via `MONGODB_URI`

## 1. Prepare env

Copy:

```bash
cp .env.docker.example .env.docker
```

Fill in at least:

- `NEXTAUTH_SECRET`
- `MONGODB_URI`
- `MONGODB_DB`

If you want asset uploads to work, also fill:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_BUCKET`
- `CDN_BASE_URL`

## 2. Build and run

```bash
docker compose --env-file .env.docker up -d --build
```

## 3. Open apps

- Admin: `http://localhost:3000`
- Storefront: `http://localhost:3002`

## 4. Stop

```bash
docker compose --env-file .env.docker down
```

To also remove MySQL data:

```bash
docker compose --env-file .env.docker down -v
```

## Notes

- MySQL schema is initialized automatically from `packages/db-mysql/schema`.
- Existing Atlas Mongo data can be reused by pointing `MONGODB_URI` to your cluster.
- New testers can sign up through the admin app without manual seeding.
- If you want to distribute prebuilt images later, build and push `Dockerfile.admin` and `Dockerfile.storefront` outputs to Docker Hub or GHCR, then swap the compose `build` blocks for `image`.
