# NestJS Todo API

A small REST API for managing todos, built with NestJS, TypeORM and PostgreSQL.
It started as a learning project: layered modules, dependency injection, a real
ORM, and request validation.

## Requirements

- Node.js 22 (developed on v22.21.1)
- Docker with Docker Compose (for the PostgreSQL database)

## Run it

```bash
git clone https://github.com/chirinosjor/nestjs-todo-api.git
cd nestjs-todo-api
npm install
docker compose up -d      # starts PostgreSQL on port 5432
npm run start:dev         # starts the API on http://localhost:3000
```

The database tables are created automatically on startup.

## Endpoints

| Method | Path         | Description                                  |
| ------ | ------------ | -------------------------------------------- |
| GET    | `/todos`     | List todos (soft-deleted ones are hidden)    |
| GET    | `/todos/:id` | Get one todo, or 404                         |
| POST   | `/todos`     | Create a todo                                |
| PUT    | `/todos/:id` | Replace a todo, or 404                       |
| DELETE | `/todos/:id` | Soft delete (sets `status` to `deleted`)     |

Create and update bodies are validated and must look like this:

```json
{
  "title": "Buy milk",
  "description": "Two litres",
  "status": "pending"
}
```

`status` must be one of `created`, `pending`, `completed`, `deleted`. Invalid
bodies get a `400` listing every problem. The `id` always comes from the URL;
an `id` in the body is ignored.

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","description":"Two litres","status":"pending"}'
```

## Notes

- The database credentials (`todo_user` / `todo_password`) are hardcoded in
  `docker-compose.yml` and `src/app.module.ts`. They are local development
  values only; a deployed version would read them from environment variables.
- `synchronize: true` lets TypeORM create and alter tables automatically. That
  is convenient locally, but a production setup should use migrations.
- There are no automated tests and no authentication yet.
