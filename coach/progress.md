# Learning Path: Backend development with NestJS (Todo API)
Last updated: 2026-10-25

## Level snapshot
Beginner-intermediate in NestJS specifics, carrying substantial transferable
backend experience from the Express Auth API. Sessions 9-10 (2026-10-20 and
2026-10-25, five days apart). PROJECT FINISHED against the revised finish line:
repository CRUD, DTO validation on create/update, README pushed to GitHub.
Jest tests were deliberately deferred to the Java project (his call). The
queued next project (Todo API in Java / Spring Boot) can start.

## Mastered (can explain from memory + apply)
- Nest CLI bootstrap and generic starter shape — 2026-08-26.
- Layered architecture, decorators, DI core reasoning, constructor injection
  + singleton scope, module tree / dynamic modules — all retired.
- Nest parameter decorators and HTTP verb decorators — 🟢.
- Docker Compose + container isolation / port-mapping — 🟢.
- `TypeOrmModule.forRoot()` wiring; TS generic erasure → `@InjectRepository`.
- Async DB access → `Promise<T>`; `await` when *inspecting* a repository
  result vs. returning it (Nest resolves a returned Promise).
- Nest exception propagation (404 via `NotFoundException`, unexpected error →
  generic 500) — via observed behavior, 2026-10-18.
- TS literal widening + `as const`; merged-object update pattern
  (find → null check → spread → save).
- **NEW 2026-10-25 — spread precedence:** later keys win; put the URL `id`
  last (`{ ...selectedTodo, ...payload, id }`). Verified live (URL id won).
  Reached via rung 1-2 (guessed "first", corrected via the precedence rule).
- **NEW 2026-10-25 — DTO = class, not interface, because interfaces are
  erased.** Self-explained after one nudge: erased at compile time → nothing
  at runtime for the validator to read; a class survives and holds decorator
  metadata. Same erasure idea as `@InjectRepository`.
- **NEW 2026-10-25 — a type annotation enforces nothing at runtime; a pipe
  reads the decorator metadata.** Predicted correctly that `{ title: 123 }`
  still wouldn't be rejected before `ValidationPipe`, then that it would be a
  400 after `app.useGlobalPipes(new ValidationPipe())`. Needed the nudge that
  the *type* is not what fails; `@IsString()` is.
- `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`, `@IsIn([...])`)
  are decorator factories (called with `()`), same as `@Get()`.
- TS checks shapes structurally: a DTO fits `Omit<Todo, 'id'>` once it has all
  the same fields.
- `forRoot` vs `forFeature` — RETIRED 2026-10-20 at his request (never fully
  recalled over 4 asks; retired by decision, not a passed teach-back).

## Shaky / weak spots (needs spaced review)
- Missing `await` on a repository result (3 occurrences across two sessions;
  none this session since no new async code was written).
- Skips the harder half of multi-part questions; answers best one step at a
  time. Said "too many questions" mid-session 2026-10-20 — fewer questions,
  more code works better for him.
- Predicted a 400 for `{ title: 123 }` before validation existed (the type was
  assumed to protect him); the first "400" was actually malformed JSON. Lesson
  re-learned: a response proves nothing unless the old code would have
  answered differently.
- Accidentally removed working code while editing (earlier session); habit:
  re-run quick checks after any edit.
- Not yet answered: why the `Todo as TodoEntity` alias was needed when the
  interface still existed; the Nest-container half of the DI warm-up ("what
  does the container do that `createAuth(pool)` did by hand").
- Docker daemon not running at the start of a session (CLI installed, Docker
  Desktop off) — resolved; 🟡 Fragile area, fine to fold into a startup habit.

## Mental models built
- Nest Module = declarative composition root; Decorator = metadata function;
  DI container = automated `createAuth(pool)`.
- Connection pool = shared expensive resource; data lives in the DB.
- Nest awaits what a handler *returns*; a rejection or `throw` reaches the
  global exception filter. Inspecting a value needs `await` first.
- A response proves nothing unless the old implementation would have
  answered differently; stale process vs. wrong code.
- Soft delete = update `status`, hide it in reads (`Not('deleted')`).
- Types are erased; runtime behavior needs a runtime object. DTO class +
  decorators = metadata, `ValidationPipe` = the reader that enforces it.
- Defense in depth on the update path: DTO type says "no id", `id` placed
  last in the spread is the safety net, since extra body fields still arrive.

## Current focus
Project complete and pushed (commit `d2e9289` on `origin/main`). Nothing mid-way.
README written by the coach on Jorge's request ("I wouldn't learn much writing
it by hand") and NOT verified by a clean-clone test (he chose to skip it).

## Next up (planned)
1. Start the Java (Spring Boot) Todo API. Plan to bring testing in there as
   the first real exposure (Jest was deferred from this project); a first unit
   test with a mocked dependency is the same idea as DI.
2. Optional bonuses on this project, not gates: `@nestjs/config` + `.env`
   instead of hardcoded credentials; `whitelist: true` on `ValidationPipe`;
   migrations instead of `synchronize: true`; `GET /todos/:id` still returns
   soft-deleted rows; Jest tests; auth.

## Finish line (agreed 2026-10-09, revised 2026-10-25)
Final: (1) repository CRUD — DONE 2026-10-18, (2) DTO validation on create and
update — DONE 2026-10-25, (4) README pushed to GitHub — DONE 2026-10-25.
Item (3) Jest tests was DROPPED from this project by Jorge on 2026-10-25
(coach recommended keeping one unit test; he chose the minimum) and deferred
to the Java project. Testing stays 🔴 Unseen.

## Review queue (resurface these in future warm-ups)
- DI half of the Express link: what the Nest container does that
  `createAuth(pool)` did by hand — unanswered, last reviewed 2026-10-20.
- Erasure: why interface → class for DTOs, and the `@InjectRepository` link —
  last reviewed 2026-10-25.
- `await` when inspecting a Promise vs. returning it — apply, don't recite.
- Unhandled rejection in Node (fire-and-forget `.then`) — parked.
- Retired: exception propagation, container isolation, constructor
  injection/singleton, module tree, decorators, layered architecture,
  create vs save, `forRoot` vs `forFeature`.
