# Learning Path: Backend development with NestJS (Todo API)
Last updated: 2026-10-07

## Level snapshot
Beginner-intermediate in NestJS specifics, carrying substantial transferable
backend experience from the Express Auth API. This session (held the very
next day after the previous one — first data point for the shorter-cadence
experiment): finished wiring `TypeOrmModule.forRoot()` into `AppModule` and
confirmed, live, that Nest actually connects to the Postgres container — not
just that the code compiles. Also injected `@InjectRepository(Todo)` into
`TodosService`'s constructor correctly. `TodosService`'s CRUD methods
themselves are still untouched (still reading the in-memory array) — that's
queued as the very next step. Scope stays deliberately low-complexity;
priority remains finishing end-to-end. Auth still deferred/optional.

## Mastered (can explain from memory + apply)
- Nest CLI bootstrap and the resulting generic starter shape — 2026-08-26.
- Layered architecture (controller = HTTP, service = business logic) —
  carried over from Express, reconfirmed multiple times. Retired from tight
  review rotation.
- Decorators as a mechanism (`@Module`, `@Controller` attach metadata read
  later by Nest) — COLD CHECK PASSED 2026-08-31. GENERALIZED 2026-10-06
  (TypeORM's `@Entity`/`@Column`). GENERALIZED AGAIN 2026-10-07: transferred
  the already-mastered *placement* rule for parameter decorators
  (`@Param`/`@Body` go inline before the specific parameter, not above the
  class like `@Injectable`) to a brand-new decorator, `@InjectRepository`,
  correctly, after one redirect question pointing back at the known
  `@Param`/`@Body` pattern — no rung-3/4 needed. Strong, durable, keeps
  generalizing across contexts. Fully retired from active review.
- DI core reasoning (inject once, reuse the same instance) — carried over
  from Express, reapplied to Nest's automated container.
- Nest constructor injection + default singleton scope — COLD CHECK PASSED
  2026-09-03 and 2026-10-06. Retired from active review.
- Module "activation" + module tree pattern (a class/config on disk ≠ Nest
  knowing about it; must be registered via `controllers`/`providers`/
  `imports`) — COLD CHECK PASSED 2026-09-03. EXTENDED 2026-10-07: applied the
  same model to a subtler case — `TypeOrmModule.forRoot({...})`'s *return
  value* (not the bare class) must be the thing placed in `imports`. First
  attempt called `forRoot()` as a disconnected standalone statement and
  separately added the bare `TypeOrmModule` class to `imports` — caught and
  fully self-corrected (stored the return value in a variable, imported
  that) after one rung-2 hint pointing at what `forRoot()` actually returns.
  Good evidence the module-tree model is generalizing to dynamic modules,
  not just static ones.
- Array update-in-place pattern (`.find()`/`.findIndex()`) — built and
  debugged live 2026-09-03. Still backing the in-memory methods, due to
  retire once those are rewritten against the repository.
- TS `Omit<Todo, 'id'>` utility type — self-driven, transferred from React.
- Nest parameter decorators (`@Param`/`@Body`) and HTTP verb decorators — 🟢
  Solid. Reused directly as the bridge for `@InjectRepository` this session.
- Soft-delete filtering — self-caught and self-fixed, 2026-09-03.
- Docker Compose purpose and structure — 2026-10-06, reconfirmed in use this
  session.
- **Container isolation model (`docker exec`/network isolation) — PROMOTED
  2026-10-07.** This was flagged last session as needing one more light,
  unaided re-explanation before trusting it. That happened today, cold,
  unprimed: correctly reasoned that the app (running directly on the host,
  not in a container) needs the explicit `ports` mapping in
  `docker-compose.yml` to reach the isolated Postgres container at all, and
  correctly predicted that without that mapping nothing on the host could
  reach it — "without it my app wouldn't know where to send the traffic...
  since docker is isolated." No `npm run`-style host-conflation slip this
  time. Retire from tight rotation.
- **NEW 2026-10-07 — `TypeOrmModule.forRoot()` wiring + live connection,
  verified via observed behavior, not verbal recall.** Correctly predicted
  what connection info was needed (host/port/user/pass/db — recalled from
  his own `docker-compose.yml`), correctly fixed `host: 'postgres'` →
  `host: 'localhost'` himself once asked to reconsider it against the
  isolation/port-mapping reasoning (the app isn't itself a Docker service
  yet, so the container's internal service name doesn't resolve for it).
  Ran the app, read the log output, and correctly identified
  `TypeOrmCoreModule dependencies initialized` with no error between it and
  the next line as the actual success signal — not just "Nest started."
- **NEW 2026-10-07 — self-driven failure testing (break-and-observe),
  unprompted.** After confirming the happy path, independently tried a
  wrong password to see what would happen, with no prompting ("im here to
  break things in order to learn"). This directly falsified his own
  predict-then-verify guess from minutes earlier (he'd predicted a silent
  hang) — actual behavior was a clear `ERROR` log plus visible retry
  attempts. He correctly updated the model himself when this was pointed
  out. This is exactly his self-identified strongest learning mode (applied
  retrieval / break-and-observe) showing up unprompted in a new context —
  worth continuing to name positively, logged cross-cutting in the global
  profile.
- **NEW 2026-10-07 — TS generic type erasure as the reason
  `@InjectRepository(Todo)` is needed.** Genuinely new material, taught
  directly with full reasoning (not hint-laddered, since there's no prior
  analog to derive it from): TS generics like `Repository<Todo>` vanish at
  compile time, leaving only the bare `Repository` class at runtime — unlike
  a concrete class such as `TodosService`, which has exactly one provider
  token and no ambiguity. Since TypeORM registers one repository instance
  *per entity*, Nest needs `@InjectRepository(Todo)` to know which one you
  mean. First teach-back attempt correctly captured the core erasure/
  ambiguity reasoning, but conflated it with a separate, unrelated question
  he raised himself (see Shaky section) — flagged and untangled before
  ending the session, not left hanging.

## Shaky / weak spots (needs spaced review)
- **Nest exception/`throw` propagation model (HTTP exception filter, e.g.
  `NotFoundException`) — STILL UNRESOLVED, do not confuse with this
  session's TypeORM connection-error logging.** These are different
  mechanisms: the DB-connection retry/error log observed this session comes
  from TypeORM's own internal logger, not Nest's HTTP exception filter. The
  plan from 2026-10-06 (retest the exception-filter model via observed
  behavior in a running request, e.g. trigger a real `NotFoundException` and
  watch the actual HTTP response) has NOT happened yet — still pending, keep
  it queued, ideally once a repository-backed `getTodoById` can 404 for
  real.
- **NEW 2026-10-07 — conflated two separate reasons at session end (caught
  and corrected same session, light spot-check next time):** merged "why
  `@InjectRepository` is needed" (generic erasure — true regardless of which
  `Todo` type backs the generic) with "why `todos.interface.ts` will
  eventually be deleted" (duplicate-shape cleanup — unrelated to erasure).
  Concretely assumed switching to the entity type instead of the interface
  would remove the need for the decorator — it wouldn't; the decorator is
  needed either way. Corrected directly before the session ended; worth one
  light unaided check next time this comes up (e.g. once the interface is
  actually deleted, ask him to state again why `@InjectRepository` is still
  needed afterward).
- Raw JS array index assignment (`arr[i] = x`) — still pending a light
  check, but will retire naturally once the in-memory methods are deleted
  next session (soon).

## Mental models built
- Nest Module = a declarative composition root — same job as Express's
  `server.ts`, described via a decorator's config object.
- Decorator = a function that attaches metadata to the class/method/
  parameter declared directly below/beside it, read later by whatever
  framework/library consumes it — confirmed again this session to generalize
  to a brand-new decorator (`@InjectRepository`) via its *placement* rule
  alone, reusing `@Param`/`@Body` as the template.
- Nest DI container = the automated version of the `createAuth(pool)`
  pattern from Express: `providers` registers what's available, a
  constructor parameter's type declares what's wanted, the container
  matches, instantiates once, and injects the same instance everywhere.
- **NEW — Dynamic module registration = the module-tree model extended:**
  it's not enough for a module class to exist and be imported — when a
  module needs runtime configuration (like DB credentials), it's `.forRoot()`
  (or similar) call's *return value* that must be the thing placed in
  `imports`, not the bare class. Calling the configuration function and
  discarding its result registers nothing.
- **NEW — TS generic erasure:** generics are a compile-time-only concept:
  `Repository<Todo>` and `Repository<User>` are indistinguishable at
  runtime — both are just `Repository`. Anything that needs to disambiguate
  between them at runtime (like Nest's DI container) needs an explicit,
  non-generic signal — hence `@InjectRepository(Todo)`.
- A running container is an isolated environment with its own filesystem/
  process space — confirmed solid: without the `ports` mapping in
  `docker-compose.yml`, a host-side process has no way to reach it at all.
- ORM "Entity" = a TS class that is simultaneously the blueprint for a DB
  table AND the in-memory shape of one row.

## Current focus
Step 1 of the ORM migration (ORM → DTO validation → Jest tests) is now
functionally connected: `TypeOrmModule.forRoot()` is wired into `AppModule`
and the live connection to Postgres is confirmed (verified by running the
app and reading the log, plus a self-driven failure test). `TodosService`'s
constructor now correctly injects `@InjectRepository(Todo) private readonly
todosRepository: Repository<Todo>`. NOT yet done: the actual CRUD method
bodies (`getTodos`, `getTodoById`, `createTodo`, `updateTodo`, `deleteTodo`)
still read/write `this.todos`, the old in-memory array — `todosRepository`
is injected but unused so far. `todos.interface.ts` and the `Todo`/
`TodoEntity` naming collision are still present, deliberately, until the
methods are migrated. Clean stopping point, nothing broken or mid-edit.

## Next up (planned)
1. Rewrite `TodosService`'s methods one at a time against `todosRepository`
   (not all at once — genuinely new pattern). Natural order: start with
   `getTodos()` → `.find()` (or `.find({ where: { status: Not('deleted') }
   })` for the soft-delete filter), confirm live via the running app before
   moving to the next method.
2. Once all methods are migrated: delete `todos.interface.ts`, drop the
   `TodoEntity` alias, and use the entity (`Todo` from `todos.entity.ts`) as
   the single shape everywhere. Good moment to re-confirm the
   erasure-vs-duplication distinction flagged in Shaky above.
3. Trigger a real `NotFoundException` against the now-live DB-backed
   `getTodoById` and observe the actual HTTP response — this is the overdue
   retest of the exception-propagation model via real behavior instead of
   verbal recall (queued since 2026-10-06).
4. Swap `synchronize: true` for real migrations (flagged repeatedly as the
   "closest to real teams" target, not yet done).
5. DTO validation (class-validator + pipes), then Jest unit/e2e tests.
6. Auth (JWT) — still deliberately deferred, stretch goal only.

## Review queue (resurface these in future warm-ups)
- Nest exception/HTTP filter propagation — still unresolved across two
  verbal cold-checks; next retest must be via real triggered behavior (see
  Next up #3), not another verbal recall.
- Erasure-vs-duplication conflation (`@InjectRepository` reason vs.
  interface-deletion reason) — new 2026-10-07, light check once the
  interface is actually deleted.
- Array index assignment / find-findIndex-write-back — will retire once the
  in-memory methods are deleted (imminent).
- Container isolation model — RETIRED 2026-10-07, confirmed unaided.
- Constructor injection / singleton scope — retired.
- Module tree / dynamic module registration — retired, now confirmed to
  extend to dynamic modules (`forRoot()`) as well as static ones.
- Decorators mechanism — retired, now confirmed to generalize to a third
  context (parameter-decorator placement transferred to `@InjectRepository`).
- Layered architecture + DI reasoning transfer — retired.
