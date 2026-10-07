# Learning Path: Backend development with NestJS (Todo API)
Last updated: 2026-10-06

## Level snapshot
Beginner-intermediate in NestJS specifics, carrying substantial transferable
backend experience from the Express Auth API. This session: versioned the
project for the first time (git init + initial commit + pushed to a public
GitHub repo, explicitly so it can be shown later), and started the first real
ORM integration (Postgres + TypeORM), replacing the in-memory array from
session 3. Explicitly asked to optimize this setup for "closest to real dev
team practices" rather than the fastest path (Postgres via Docker, not a bare
local install; real migrations planned instead of `synchronize: true`) — note
this as a standing preference, not a one-off. Scope stays deliberately
low-complexity; priority remains finishing end-to-end. Auth still
deferred/optional.

## Mastered (can explain from memory + apply)
- Nest CLI bootstrap and the resulting generic starter shape — 2026-08-26.
- Layered architecture (controller = HTTP, service = business logic) —
  carried over from Express, reconfirmed multiple times. Retired from tight
  review rotation.
- Decorators as a mechanism (`@Module`, `@Controller` attach metadata read
  later by Nest) — COLD CHECK PASSED 2026-08-31. Retired from tight rotation.
  GENERALIZED 2026-10-06: unprompted recognized TypeORM's `@Entity`/`@Column`
  as the same mechanism applied by a different consumer — strong signal this
  is a durable mental model, not framework-specific knowledge.
- DI core reasoning (inject once, reuse the same instance) — carried over
  from Express, reapplied to Nest's automated container.
- Nest constructor injection + default singleton scope — COLD CHECK PASSED
  2026-09-03, unprimed. RECONFIRMED 2026-10-06 in warm-up: re-derived the
  state-loss reasoning again from scratch using the real `TodosService`
  in-memory array as the concrete example ("no tendría contexto, por eso
  debemos usar esa misma instancia"). Fully retired from active review.
- Module "activation" + module tree pattern (a class on disk ≠ Nest knowing
  about it; must be registered via `controllers`/`providers`/`imports`;
  `AppModule` is the root of a tree) — COLD CHECK PASSED 2026-09-03. Retired
  from tight rotation.
- Array update-in-place pattern (`.find()` for reading vs. `.findIndex()` +
  direct index assignment for persisting a change) — built and debugged live
  2026-09-03.
- TS `Omit<Todo, 'id'>` utility type — self-driven, transferred from React.
- Nest parameter decorators (`@Param`/`@Body`) and HTTP verb decorators — 🟢
  Solid, fastest transfer yet, self-caught a duplicate-route bug.
- Soft-delete filtering — self-caught and self-fixed, 2026-09-03.
- **NEW 2026-10-06 — Docker Compose purpose and structure.** First time
  authoring a compose file himself (previously only `docker exec`/`psql`
  against an already-running container). Correctly reasoned, with guidance,
  that `environment` holds DB access credentials and that TypeORM's own
  version belongs in `package.json`/npm, not in `docker-compose.yml`
  (two separate "homes" — infra config vs. application library), by
  recalling the equivalent split from the Express project (`pg` driver
  version vs. Postgres server version). Correctly predicted, after one
  redirect, the consequence of omitting `volumes` (data loss on
  recreation, not literally "a new database"). Self-diagnosed and fixed the
  first `docker compose up` failure himself (Docker Desktop app wasn't
  running) with no prompting.
- **NEW 2026-10-06 — Container isolation model (`docker exec`).** Needed two
  rounds of correction: first instinct compared `docker exec` to `npm run`
  (a host-side script) and described `psql` as running "in the PC's
  terminal where the container is" — missed that a container is a fully
  separate, isolated filesystem/process space. After correction, completed
  the full sentence unaided: "docker, ejecuta lo siguiente dentro del
  contenedor X, de forma interactiva, corriendo psql como ese usuario." Also
  self-generated a strong, correct analogy for `-it` unprompted (comparing
  it to `rails console` dropping into an interactive prompt vs. a script
  that runs and exits) — better than the one offered to him.
- **NEW 2026-10-06 — TypeORM Entity decorators (`@Entity`, `@Column`,
  `@PrimaryGeneratedColumn`).** Correctly answered "why is it called Entity"
  (table + in-memory record, distinct from a plain compile-time-only
  interface) after one explanation. First code attempt omitted `@Entity()`
  entirely — self-corrected after being asked to check which of the three
  decorators was missing.
- **NEW 2026-10-06 — TS definite assignment assertion (`!`) on
  ORM-populated entity fields.** Genuinely new TS syntax (strict
  `strictPropertyInitialization`), taught directly with reasoning since it's
  arbitrary syntax, not derivable from first principles. Correctly taught
  back in his own words: "lo va a asignar alguien más que sería TypeORM y no
  JS puro." Applied correctly to all four entity fields.
- **NEW 2026-10-06 — Sound, justified tooling decisions.** Chose TypeORM
  over Prisma with explicit reasoning (reinforces the decorator mechanism he
  already knows). Chose Postgres-via-Docker over a bare local install,
  explicitly reasoning it's what real teams do (reproducibility). Chose
  `id: number` over `string`/uuid with a clean "no reason to add that
  complexity" justification, appropriately matching this project's
  deliberately low-complexity scope.

## Shaky / weak spots (needs spaced review)
- **Nest exception/`throw` propagation model — REGRESSED on cold check,
  2026-10-06.** This was flagged last session as needing a genuinely cold
  check on the underlying propagation model (not just decorator-name
  recall). That check happened this session and did NOT pass cleanly: he
  correctly reasoned the plain-JS version quickly (an uncaught throw
  propagates up the call stack without needing a catch at every
  intermediate level — self-derived via a concrete funcionA/B/C example),
  but mapping that onto "who actually catches it in Nest" needed escalation
  through all four hint-ladder rungs, including a full reveal of the global
  exception filter concept (introduced in detail last session already).
  Ended with a correct, genuine teach-back, so the *mental model* did land
  this time — but the verbal cold-check format alone isn't sticking for
  this concept across sessions. Next time, test it through observed
  behavior in running code (e.g., trigger an uncaught case once
  `TypeOrmModule` is wired and watch the real response) rather than another
  purely verbal recall.
- Raw JS array index assignment (`arr[i] = x`) — light spot-check still
  pending since 2026-09-03 (not touched this session). Will likely become
  moot once the in-memory array is replaced by the TypeORM repository —
  fine to let it retire naturally once that code is deleted, rather than
  forcing a check on code about to disappear.
- Container isolation model (`docker exec` runs inside an isolated
  environment) — landed this session but only after two rounds of
  correction; worth one light unaided re-explanation next session before
  trusting it's fully settled (watch specifically whether the `npm run`
  misconception resurfaces).

## Mental models built
- Nest Module = a declarative composition root — same job as Express's
  `server.ts`, described via a decorator's config object.
- Decorator = a function that attaches metadata to the class/method
  declared directly below it, read later by whatever framework/library
  consumes it — confirmed this session to generalize beyond Nest itself
  (TypeORM uses the exact same mechanism).
- Nest DI container = the automated version of the `createAuth(pool)`
  pattern from Express: `providers` registers what's available, a
  constructor parameter's type declares what's wanted, the container
  matches, instantiates once, and injects the same instance everywhere —
  state loss is the concrete reason this matters, re-derivable per-service.
- AppModule = root of a module tree.
- Array-of-objects mutation = `.find()`/`.filter()` read without touching
  the array; `.findIndex()` + direct index assignment to actually write back.
- Nest exception model = `throw`/`catch`, framework-flavored: a global
  filter (never hand-written) automatically converts a thrown HTTP exception
  into the right status + JSON body — conceptually the same as an invisible
  `try/catch` wrapped around the whole request/response cycle.
- **NEW — Docker Compose = a declarative "recipe" for the container(s) a
  project needs, so the whole stack starts the same way on any machine with
  one command, instead of typing a long `docker run` from memory each time —
  same spirit as `package.json` declaring dependencies declaratively.**
- **NEW — A running container is an isolated environment with its own
  filesystem/process space. Without an explicit `volumes` mapping, any data
  written inside it lives only in that disposable space and is lost when
  the container is removed and recreated.**
- **NEW — ORM "Entity" = a TS class that is simultaneously the blueprint for
  a DB table AND the in-memory shape of one row — distinct from a plain
  interface, which only describes a compile-time shape with zero connection
  to persistence.**
- **NEW — TS definite assignment assertion (`!`) = telling the compiler
  "trust me, this will be filled by something you can't trace (TypeORM
  hydrating a row), not by a constructor you wrote."**

## Current focus
Mid-way through the first real ORM integration (step 1 of the 3-step plan
set on 2026-10-06: ORM → DTO validation → Jest tests). Done this session:
`docker-compose.yml` running Postgres 16, verified live via `psql` (empty DB
confirmed); `@nestjs/typeorm` + `typeorm` + `pg` installed; `Todo` entity
(`src/todos/todos.entity.ts`) fully written and compiling clean
(`id: number` primary generated, `title`/`description`/`status: string`, all
with `!`). NOT yet done: `TypeOrmModule` is not wired into any Nest module
yet, and `TodosService` still uses the in-memory array exactly as before —
nothing in the running app actually talks to Postgres yet. This is a clean
stopping point, not a broken/mid-edit one.

Also this session: the project was git-initialized for the first time (no
prior commits existed), committed, and pushed to a new public GitHub repo —
https://github.com/chirinosjor/nestjs-todo-api — explicitly so it can be
shown later (portfolio intent named directly).

## Next up (planned)
1. Configure `TypeOrmModule.forRoot()`/`forRootAsync()` with connection
   config matching the `docker-compose.yml` credentials, and register the
   `Todo` entity.
2. Replace `TodosService`'s in-memory array with `@InjectRepository(Todo)`
   and rewrite the CRUD methods against the repository — this also retires
   the old `todos.interface.ts` and the manual `this.todos.length + 1` id
   counter.
3. Once the basic connection works: swap `synchronize: true` (if used as a
   bootstrapping shortcut) for real migrations — flagged this session as
   the "closest to real teams" approach, not yet done.
4. DTO validation (class-validator + pipes), then Jest unit/e2e tests (per
   the 2026-10-06 direction-setting session).
5. Auth (JWT) — still deliberately deferred, stretch goal only.

## Review queue (resurface these in future warm-ups)
- Nest exception/`throw` propagation — regressed on cold check 2026-10-06;
  retest via observed behavior in running code next time, not verbal recall.
- Array index assignment / find-findIndex-write-back — still pending a light
  check since 2026-09-03; let it retire once the array code is deleted
  rather than forcing a check on soon-to-be-removed code.
- Container isolation model (`docker exec`) — new 2026-10-06, needs one
  light unaided re-explanation next session.
- Constructor injection / singleton scope — retired, fully confirmed again
  2026-10-06.
- Module tree / AppModule — retired, spot-check occasionally.
- Decorators mechanism — retired, now confirmed to generalize beyond Nest
  (TypeORM) — strong, durable model.
- Layered architecture + DI reasoning transfer — retired.
