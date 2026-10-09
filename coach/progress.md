# Learning Path: Backend development with NestJS (Todo API)
Last updated: 2026-10-09

## Level snapshot
Beginner-intermediate in NestJS specifics, carrying substantial transferable
backend experience from the Express Auth API. Third session in three
consecutive days (cadence experiment, day 3). This session: hit and fixed a
real `UnknownDependenciesException` (missing `TypeOrmModule.forFeature([Todo])`
in `TodosModule`), so the app boots again with the repository injected.
`getTodos()` was started but is HALF-MIGRATED and does not yet read from
Postgres (see Current focus). Scope stays deliberately low-complexity;
priority remains finishing end-to-end. Auth still deferred/optional.

## Mastered (can explain from memory + apply)
- Nest CLI bootstrap and the resulting generic starter shape — 2026-08-26.
- Layered architecture (controller = HTTP, service = business logic) —
  carried over from Express. Retired from tight review rotation.
- Decorators as a mechanism (`@Module`, `@Controller`, `@Entity`,
  `@InjectRepository` placement) — generalized across three contexts.
  Fully retired from active review.
- DI core reasoning (inject once, reuse the same instance) — carried over
  from Express. Warm-up 2026-10-09: first answer was wrong (said per-call
  pools would lose data across calls — data lives in Postgres, not the
  connection); self-corrected after rung 1-2 hints and a confidence-5
  prediction that per-request pools exhaust Postgres connections
  (`max_connections`) and pay setup cost every time. Final one-line statement:
  "use the same connection(s) for several requests". Treat as 🟡 on the
  *why* wording (pool = shared expensive resource, not data isolation).
- Nest constructor injection + default singleton scope — retired.
- Module "activation" + module tree pattern — COLD CHECK PASSED 2026-09-03,
  extended to dynamic modules 2026-10-07. EXTENDED AGAIN 2026-10-09: a
  per-feature module needs its own registration of the repository provider;
  `forRoot` in `AppModule` does NOT provide `Repository<Todo>` to
  `TodosModule`. Initial guess was that `forRoot`'s `entities` list did that;
  corrected by pointing at the error message itself ("not available in the
  TodosModule module"). Spotted unprompted that `TodosModule` (his own) and
  `forFeature(...)` (library-built) are both just modules in `imports`.
- Array update-in-place pattern (`.find()`/`.findIndex()`) — will retire
  once the in-memory methods are deleted.
- TS `Omit<Todo, 'id'>` utility type — self-driven, transferred from React.
- Nest parameter decorators (`@Param`/`@Body`) and HTTP verb decorators — 🟢.
- Soft-delete filtering — self-caught and self-fixed, 2026-09-03. (Note: the
  filter was dropped from `getTodos()` in today's half-migration.)
- Docker Compose purpose and structure; container isolation / port-mapping
  model — 🟢. Reconfirmed 2026-10-09 in passing (5432 = app-to-Postgres, not
  the HTTP port).
- `TypeOrmModule.forRoot()` wiring + live connection (2026-10-07).
- Self-driven break-and-observe testing (2026-10-07).
- TS generic type erasure as the reason `@InjectRepository(Todo)` is needed —
  RECALLED 2026-10-09 in warm-up, correct (one nuance: it's the DI container
  that can't disambiguate, not `Repository` itself).
- **NEW 2026-10-09 — async DB access means Promise return type.** Reasoned
  correctly "async call to the db?" then `Promise<Todo[]>` unprompted-ish
  (with an IDE prompt). `find()` with no args = "give me everything".

## Shaky / weak spots (needs spaced review)
- **Nest exception/`throw` propagation model — STILL UNRESOLVED.** Also now
  connected to a new open question: does an async controller need
  `await`/`try`/`catch`? Hypothesis from Express habit: yes. Expected answer:
  no, Nest awaits returned Promises and unhandled throws reach the global
  exception filter. He had NOT changed the controller and didn't know why it
  works (he forgot to check). Observed-behavior retest still pending.
- **NEW 2026-10-09 — handling of async in `getTodos()`**: current code fires
  `this.todosRepository.find().then(...)` without returning/awaiting it, then
  returns the stale in-memory `this.todos`. The result of GET /todos was
  therefore `[]` from the old array, NOT from Postgres. Needs: `async`,
  `return this.todosRepository.find()` (or `await`), signature
  `Promise<Todo[]>`, and a note on WHY fire-and-forget returns stale data.
  Also assumed the `[]` response proved the DB read worked — a "did my
  verification actually test what I think it tests?" gap (the coach also made
  this mistake in-session; corrected before wrap-up).
- **NEW 2026-10-09 — `forRoot` vs `forFeature` division of labor**: partly
  taught, teach-back incomplete. Got: each feature module calls `forFeature`
  with its entities; one shared pool. Needs one clean cold restatement:
  `forRoot` = connection/pool once in `AppModule`; `forFeature` = per-module
  `Repository<Entity>` provider on that shared connection.
- **NEW 2026-10-09 — `create()` vs `save()` vs `insert()`**: guessed `.insert`
  for creating a row. Not wrong (it exists) but returns an insert result, not
  the entity. Expected pairing: `create()` (sync, in-memory build) +
  `save()` (async, writes + returns entity with id).
- Erasure-vs-duplication conflation (`@InjectRepository` reason vs.
  interface-deletion reason) — light check once the interface is deleted.
- Raw JS array index assignment — retires once in-memory methods deleted.

## Mental models built
- Nest Module = a declarative composition root.
- Decorator = a function that attaches metadata read later by a framework.
- Nest DI container = automated `createAuth(pool)`: register, declare,
  match, instantiate once, inject the same instance.
- Dynamic module registration: a `.forRoot()`/`.forFeature()` call's return
  value is what goes in `imports`.
- **NEW — Connection pool is the shared expensive resource; data lives in
  the DB, not the connection.**
- **NEW — `forRoot` (once, connection) vs `forFeature` (per module,
  repository provider on the shared connection).**
- TS generic erasure: `Repository<Todo>` and `Repository<User>` are the same
  at runtime, hence `@InjectRepository(Todo)`.
- ORM Entity = DB table blueprint + in-memory row shape.

## Current focus
Migrating `TodosService` to the repository, step 1 (`getTodos`). Code state:
- [todos.module.ts](src/todos/todos.module.ts): DONE. `imports:
  [TypeOrmModule.forFeature([Todo])]`. App boots, `GET /todos` returns 200 [].
- [todos.service.ts](src/todos/todos.service.ts): `getTodos()` is
  HALF-MIGRATED (compiles and runs, but see Shaky): calls
  `this.todosRepository.find().then(...)` fire-and-forget and returns
  `this.todos`, and the soft-delete `filter` was removed. Other methods
  (`getTodoById`, `createTodo`, `updateTodo`, `deleteTodo`) still use the
  in-memory array. Controller untouched.
Not broken, but misleading: a 200 `[]` does not prove DB reads work.

## Next up (planned)
1. Fix `getTodos()`: make it `async`, `return this.todosRepository.find()`
   (or `await` it), type it `Promise<Todo[]>`. Re-add soft-delete filtering
   via `where: { status: Not('deleted') }`. Confirm live with data in the
   table (needs createTodo first, or insert a row via TablePlus).
2. Migrate `createTodo` with `create()` + `save()`; predict-then-verify with
   `POST /todos` then `GET /todos` — first real proof the DB is being read.
3. Answer: why does the controller work unchanged when the service returns a
   Promise? (Unanswered this session.) Then retest exception propagation via
   a real 404 from the DB-backed `getTodoById`.
4. Migrate remaining methods, delete `todos.interface.ts`/`TodoEntity`
   alias, re-check erasure-vs-duplication.
5. DTO validation on create/update, then Jest tests (service unit + one e2e).
6. README with run instructions, pushed to GitHub.
7. Bonus, not gates: replace `synchronize: true` with migrations; auth.

## Finish line (agreed 2026-10-09)
The project is "done" when: (1) all five CRUD methods use the repository,
(2) DTO validation on create and update, (3) basic Jest tests (service unit +
one e2e), (4) README pushed to the public GitHub repo. Only then does the
queued next project start: the same Todo API in Java (Spring Boot). Jorge set
this gate himself because he tends to leave projects half-done — if he drifts
toward Java early, gently name that tension.

## Review queue (resurface these in future warm-ups)
- Controller + returned Promise: why no change needed? (new, first item)
- `forRoot` vs `forFeature` teach-back — last reviewed 2026-10-09.
- Nest exception/HTTP filter propagation — verify via real triggered 404.
- `create` vs `save` vs `insert`.
- Why a pool is injected once (data vs. connection distinction) — 2026-10-09.
- Erasure-vs-duplication — after interface deleted.
- Retired: container isolation, constructor injection/singleton, module tree,
  decorators, layered architecture.
