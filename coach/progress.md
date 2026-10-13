# Learning Path: Backend development with NestJS (Todo API)
Last updated: 2026-10-13

## Level snapshot
Beginner-intermediate in NestJS specifics, carrying substantial transferable
backend experience from the Express Auth API. Session 7 (four days after the
last one; neutral context for the cadence experiment). Two service methods
now genuinely run against Postgres and were verified with real data:
`getTodos()` (seeded a row by hand in TablePlus and saw it come back) and
`createTodo()` (`create()` then `save()`, POST ids come from Postgres).
Remaining service methods still use the in-memory array. Scope stays
deliberately low-complexity; priority remains finishing end-to-end. Auth
deferred/optional.

## Mastered (can explain from memory + apply)
- Nest CLI bootstrap and the generic starter shape — 2026-08-26.
- Layered architecture (controller = HTTP, service = business logic) —
  carried over from Express. Retired.
- Decorators as a mechanism (`@Module`, `@Controller`, `@Entity`,
  `@InjectRepository` placement) — generalized across three contexts. Retired.
- DI core reasoning (inject once, reuse) and Nest constructor injection +
  singleton scope — retired. Pool *why* wording: see 2026-10-09 note
  (pool = shared expensive resource, data lives in the DB).
- Module tree / "activation" pattern, including dynamic modules
  (`forRoot`) and per-feature registration (`forFeature`) — retired as
  concept; the `forFeature` teach-back is still open (see Shaky).
- Nest parameter decorators and HTTP verb decorators — 🟢.
- Soft-delete filtering — 🟢; now expressed as `where: { status:
  Not('deleted') }` in `find()`, written by him this session unaided.
- Docker Compose + container isolation / port-mapping model — 🟢.
- `TypeOrmModule.forRoot()` wiring + live connection; self-driven
  break-and-observe testing.
- TS generic type erasure → why `@InjectRepository(Todo)` is needed.
- Async DB access → `Promise<T>` return types. **2026-10-13: wrote
  `getTodos(): Promise<Todo[]>` and `createTodo(): Promise<Todo>` himself,
  returning the repository promise directly (no `.then`, no `await`
  needed).**
- **NEW 2026-10-13 — verifying a read path with seeded data.** Added a row
  by hand in TablePlus and confirmed it came back from `GET /todos` — the
  response that the in-memory version could not have produced. Directly
  resolves the 2026-10-09 "empty array doesn't prove a DB read" gap.
- **NEW 2026-10-13 — self-diagnosed stale-process bug.** `POST` returned ids
  1, 2, 3 while the table already held a row, and `GET` showed only the
  hand-made row. After a nudge to compare the ids against the old
  `todos.length + 1` logic, he found he'd started the server with `npm run
  start` instead of `npm run start:dev` (no `--watch`), so edits to
  `createTodo` were never loaded. Fixed by restarting. Lesson: when code
  looks right but behavior matches the OLD code, suspect the running process
  is stale before suspecting the code.
- **NEW 2026-10-13 — `create()` vs `save()`:** correctly stated create
  builds the entity object in memory, save writes it to the DB and is the
  async one. (Resolves the earlier `insert` mix-up.)
- **OBSERVED 2026-10-13 (not yet verbally explained) — the controller needs
  no `await`/`try-catch`:** `TodosController` returns the Promise from the
  service directly and the POST/GET responses work correctly. He said he
  "forgot about" the question and later gave a partial intuition ("Nest
  provides an invisible layer that resolves promises" — same as the
  exception-filter layer). Treat as understood-in-practice; ask for a
  one-line explanation next time.

## Shaky / weak spots (needs spaced review)
- **Nest exception/`throw` propagation — STILL UNRESOLVED as a verbal model.**
  Needs an observed-behavior retest with a real 404 from a DB-backed
  `getTodoById` (not another verbal cold check). Related, parked, UNANSWERED:
  what happens in Node to a rejected Promise nobody handles? The 2026-10-13
  Postgres-stopped test showed the server "couldn't connect"; likely the
  process crashed from an unhandled rejection in the old fire-and-forget
  `.then(...)` — he didn't look at the terminal to confirm, so it's
  unconfirmed.
- **`forRoot` vs `forFeature` teach-back — STILL INCOMPLETE** (asked three
  times, never closed). Got: `forRoot` = initial DB connection config, once,
  in `AppModule`; `forFeature` "imports the orm module in other modules".
  Missing: `forFeature([Entity])` provides a `Repository<Entity>` provider
  to that module, which `TodosService`'s `@InjectRepository(Todo)`
  constructor parameter needs; `forRoot` alone does not. One clean
  one-sentence cold restatement needed.
- Why a connection pool is injected once (data vs. connection wording) —
  re-check lightly; fine conceptually.
- Erasure-vs-duplication conflation (`@InjectRepository` reason vs.
  interface-deletion reason) — light check once `todos.interface.ts` is
  deleted.
- Tendency to skip the harder half of multi-part questions (answers the
  last/easiest part) — noticed 2026-10-13 across several turns; ask one
  question at a time and re-ask the skipped one.

## Mental models built
- Nest Module = declarative composition root.
- Decorator = function attaching metadata read by a framework.
- Nest DI container = automated `createAuth(pool)`.
- Dynamic module registration: a `.forRoot()`/`.forFeature()` call's return
  value goes in `imports`.
- Connection pool = shared expensive resource; data lives in the DB.
- `forRoot` (once, connection) vs `forFeature` (per module, repository
  provider on the shared connection) — model taught, teach-back pending.
- TS generic erasure.
- ORM Entity = table blueprint + in-memory row shape.
- **NEW — Nest awaits whatever a handler returns:** a returned Promise is
  resolved by Nest before the response is written; a rejection reaches the
  exception filter. So handlers just `return` the service's promise.
- **NEW — Stale process vs. wrong code:** if behavior matches the *old* code,
  check how the process was started (`start:dev` = watch/rebuild) before
  debugging the code.
- **NEW — A response proves nothing unless the old implementation would have
  produced a different one** (seed a row only the DB could return).

## Current focus
Migrating `TodosService` method by method to `todosRepository`.
DONE and verified live: `getTodos` (find + `Not('deleted')`), `createTodo`
(`create` + `save`). Module wiring DONE (`forFeature([Todo])`).
NOT yet done: `getTodoById`, `updateTodo`, `deleteTodo` still operate on the
in-memory `this.todos` array (so the controller's GET /:id, PUT /:id,
DELETE /:id don't see DB rows yet). `todos.interface.ts` / `TodoEntity`
alias still present. Code compiles and runs; nothing mid-edit.
Always run with `npm run start:dev`.

## Next up (planned)
1. Migrate `getTodoById` — predict first: which repository method fetches
   one row by id, what does it return when nothing matches
   (`findOneBy` → `Todo | null`), and what should the signature be
   (`Promise<Todo | null>`). Then make `GET /todos/:id` 404 for a missing id
   and observe the actual HTTP response — this is also the overdue
   observed-behavior retest of exception propagation.
2. Migrate `updateTodo` and `deleteTodo` (check whether delete should stay a
   soft delete: set `status = 'deleted'` rather than removing the row).
3. Delete `todos.interface.ts` and the `TodoEntity` alias; use the entity
   everywhere; re-check erasure-vs-duplication.
4. DTO validation on create/update (class-validator + pipes).
5. Jest tests (service unit + one e2e).
6. README with run instructions, pushed to GitHub.
7. Bonus, not gates: migrations instead of `synchronize: true`; auth.

## Finish line (agreed 2026-10-09)
The project is "done" when: (1) all five CRUD methods use the repository,
(2) DTO validation on create and update, (3) basic Jest tests (service unit +
one e2e), (4) README pushed to the public GitHub repo. Only then does the
queued next project start: the same Todo API in Java (Spring Boot). Jorge set
this gate himself because he tends to leave projects half-done — if he drifts
toward Java early, gently name that tension. Progress: items 1 half done
(2 of 5 methods).

## Review queue (resurface these in future warm-ups)
- `forRoot` vs `forFeature` — one-sentence cold teach-back (open since
  2026-10-09; ask first thing).
- Why the controller needs no `await`/`try-catch` (Nest resolves returned
  Promises; rejections reach the exception filter) — one line.
- Unhandled rejection in Node: what happens to a rejected Promise nobody
  handles? (Parked 2026-10-13.)
- Nest exception/HTTP filter propagation — via a real 404, observed.
- Erasure-vs-duplication — after the interface is deleted.
- Retired: container isolation, constructor injection/singleton, module tree,
  decorators, layered architecture, create vs save.
