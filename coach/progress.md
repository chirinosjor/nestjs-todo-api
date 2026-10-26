# Learning Path: Backend development with NestJS (Todo API)
Last updated: 2026-10-18

## Level snapshot
Beginner-intermediate in NestJS specifics, carrying substantial transferable
backend experience from the Express Auth API. Session 8 (five days after the
last one; he opened with "after battling with myself, finally after some days
I'm here again" — neutral context, a win to protect). MILESTONE: all five CRUD
methods in `TodosService` now run against Postgres through the TypeORM
repository, verified live (including a real 404 and a real soft delete).
Finish-line item 1 of 4 is DONE. Scope stays deliberately low-complexity;
priority remains finishing end-to-end. Auth deferred/optional.

## Mastered (can explain from memory + apply)
- Nest CLI bootstrap and generic starter shape — 2026-08-26.
- Layered architecture, decorators, DI core reasoning, constructor injection
  + singleton scope, module tree / dynamic modules — all retired.
- Nest parameter decorators and HTTP verb decorators — 🟢.
- Docker Compose + container isolation / port-mapping — 🟢.
- `TypeOrmModule.forRoot()` wiring; TS generic erasure → `@InjectRepository`.
- Async DB access → `Promise<T>` return types — writes them unaided.
- Verifying a read path with seeded data; debugging a stale process
  (`start` vs `start:dev`) — 2026-10-13.
- `create()` (sync, in-memory) vs `save()` (async, writes; insert when no
  matching `id`, update when the `id` matches).
- **NEW 2026-10-18 — Nest resolves a *returned* Promise; you must `await`
  when you *inspect* the value.** Explained in his own words for returning
  ("a final layer that resolves the promise even without await, just like
  exceptions") and applied correctly: `getTodo`, `updateTodo`, `deleteTodo`
  controller handlers are `async` and `await` the service before the
  `if (!x) throw new NotFoundException()` check, after predicting that a
  Promise is always truthy so the 404 would never fire.
- **NEW 2026-10-18 — Nest exception propagation, via OBSERVED behavior.**
  `throw new NotFoundException()` → 404 with Nest's JSON body, no `try/catch`
  written; unexpected error (Postgres stopped while the app was running) →
  generic `500 Internal server error` body, process stays alive. Predicted
  the 500 correctly, and gave the right reason it is good that the body hides
  internals (info-leak prevention, same idea as the Express enumeration fix).
  This closes the retest queued since 2026-10-06.
- **NEW 2026-10-18 — TS literal widening + `as const`.** `{ ...todo, status:
  'deleted' }` stored in a `const` widens `status` to `string` and fails
  against the union type; fixed it himself with `as const` after one
  question. Needed a nudge to see why the old inline version compiled.
- **NEW 2026-10-18 — merged-object update pattern with the repository:**
  find (await) → null check → `{ ...existing, ...payload }` → `save`.
  Wrote `updateTodo` and `deleteTodo` (soft delete via `status`) himself with
  a partial template (rung 3) for delete.

- **`forRoot` vs `forFeature` — RETIRED 2026-10-20 at Jorge's request** (asked
  4 times, never fully recalled; he's done with it). Retired by his decision,
  not by a passed teach-back. Last known state: `forRoot` = connection config
  in `AppModule`; `forFeature([Entity])` provides the `Repository<Entity>` that
  `@InjectRepository` needs. Only resurface if an `UnknownDependenciesException`
  shows up naturally in the project.

## Shaky / weak spots (needs spaced review)
- **Missing `await` when using a repository result (3 occurrences, two
  sessions):** controller `getTodo` (predicted correctly in advance, fixed),
  service `updateTodo` (created a duplicate row by accident because the
  spread of a Promise is `{}`), controller `deleteTodo` (reminded). Habit
  taught: hover the variable — if its type is `Promise<...>`, you can't
  inspect it yet. Watch for a clean pass with no reminder.
- **Accidentally removed working code (`payload` merge in `updateTodo`)
  while editing.** Caught only because the coach reread the file. Concrete
  motivation for Jest tests. Habit: re-run the quick checks after any edit.
- Mixing up the Nest process and the Postgres container ("server") when
  predicting failure modes; resolved by observing the log (startup failure =
  10 retries then exit; runtime failure = 500).
- Skips the harder half of multi-part questions; when overloaded (3 fixes at
  once) said "i'm confused". Coach's fault too: keep to ONE step at a time.
- Open and unanswered: in `{ ...selectedTodo, ...payload }`, which `id` wins
  when the body's `id` differs from the URL's (the payload wins, which would
  update a different row — a real bug to fix, not yet addressed).
- Erasure-vs-duplication conflation — light check once `todos.interface.ts`
  is deleted.

## Mental models built
- Nest Module = declarative composition root; Decorator = metadata function;
  DI container = automated `createAuth(pool)`.
- Dynamic module: `.forRoot()` / `.forFeature()` return value goes in
  `imports`. `forRoot` once (connection); `forFeature` per module
  (repository provider on the shared connection) — retired 2026-10-20.
- Connection pool = shared expensive resource; data lives in the DB.
- Nest awaits what a handler *returns*; a rejection or `throw` reaches the
  global exception filter (HttpException → its status/body; anything else →
  generic 500). Inspecting a value needs `await` first.
- A response proves nothing unless the old implementation would have
  answered differently; stale process vs. wrong code.
- Soft delete = update `status`, hide it in reads (`Not('deleted')`).

## Current focus
All five `TodosService` methods use `todosRepository`: `getTodos` (find +
`Not('deleted')`), `getTodoById` (`findOneBy`), `createTodo` (create + save),
`updateTodo` (find, merge, save), `deleteTodo` (find, `status: 'deleted' as
const`, save). Controller handlers for get-by-id/update/delete are `async` and
`await` the service. `tsc --noEmit` is clean. Verified live. LEFTOVERS (dead
code, not broken): `todos: Todo[] = []` field in `TodosService`,
`todos.interface.ts`, the `Todo as TodoEntity` alias, and the controller
still types payloads with the interface.

## Next up (planned)
1. Cleanup: delete the dead `todos` array, delete `todos.interface.ts`, use
   the entity (`Todo` from `todos.entity.ts`) everywhere, drop the alias.
   Predict first: what breaks when the interface file is deleted, and will
   `@InjectRepository` still be needed (re-check erasure-vs-duplication).
2. Fix the id-mismatch hole in `updateTodo` (URL id should win over the
   body's id) — a small, concrete mini-task.
3. DTO validation on create/update (class-validator + pipes).
4. Jest tests (service unit + one e2e). Start with a test that would have
   caught the `updateTodo` merge regression.
5. README with run instructions, pushed to GitHub.
6. Bonus, not gates: migrations instead of `synchronize: true`; auth.

## Finish line (agreed 2026-10-09)
The project is "done" when: (1) all five CRUD methods use the repository,
(2) DTO validation on create and update, (3) basic Jest tests (service unit +
one e2e), (4) README pushed to the public GitHub repo. Only then does the
queued next project start: the same Todo API in Java (Spring Boot). Jorge set
this gate himself because he tends to leave projects half-done — if he drifts
toward Java early, gently name that tension. Progress: (1) DONE 2026-10-18.

**REVISED 2026-10-25 by Jorge (coach recommended keeping one unit test; he
chose the minimum):** item (3) Jest tests is DROPPED from this project and
deferred to the Java project (first real testing exposure moves there; testing
stays 🔴 Unseen). Finish line is now: (1) repository CRUD — DONE, (2) DTO
validation on create and update, (4) README pushed to GitHub. Two items left.

## Review queue (resurface these in future warm-ups)
- `await` when inspecting a Promise vs. returning it — apply, don't recite.
- Which `id` wins in the update merge — answer + fix.
- Unhandled rejection in Node: what happens to a rejected Promise nobody
  handles (the old fire-and-forget `.then`)? Parked.
- Erasure-vs-duplication — after the interface is deleted.
- Retired: exception propagation (observed 2026-10-18), container isolation,
  constructor injection/singleton, module tree, decorators, layered
  architecture, create vs save.
