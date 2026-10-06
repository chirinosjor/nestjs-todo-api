# Learning Path: Backend development with NestJS (Todo API)
Last updated: 2026-09-03

## Level snapshot
Beginner in NestJS specifics, carrying substantial transferable backend
experience from the hand-rolled Express Auth API. Milestone reached this
session: the FIRST complete feature (Todo CRUD) is built end-to-end —
interface, service, controller — and manually verified live via Insomnia,
including error paths and a self-caught soft-delete filtering bug. This is
the first time this pattern of project has produced a fully working,
confirmed slice — directly relevant given his history of abandoning
projects mid-progress. Scope stays deliberately low-complexity — priority
is finishing end-to-end, not maximizing technical depth. Auth is still
deferred/optional.

## Mastered (can explain from memory + apply)
- Nest CLI bootstrap and the resulting generic starter shape — 2026-08-26.
- Layered architecture (controller = HTTP, service = business logic) —
  carried over from Express, reconfirmed multiple times. Retired from tight
  review rotation.
- Decorators as a mechanism (`@Module`, `@Controller` attach metadata read
  later by Nest) — COLD CHECK PASSED 2026-08-31, 2nd resurface. Retired
  from tight rotation.
- DI core reasoning (inject once, reuse the same instance) — carried over
  from Express, reapplied to Nest's automated container.
- Nest constructor injection + default singleton scope — COLD CHECK PASSED
  2026-09-03, unprimed, no pool analogy given first. Correctly stated the
  DI container instantiates a provider once and reuses it across requests,
  AND — the important part — this time he *re-derived* the "why" for the
  new context instead of reusing the old TCP-connection-pool reasoning
  verbatim: he reasoned that if `TodosService` held state (e.g. an
  in-memory array), a fresh instance per request would lose that state
  before the next request could see it. Resolves last session's regression
  and the "borrows a specific memorized example instead of re-deriving the
  general principle" watch item — this was genuine re-derivation. Promoted.
- Module "activation" + module tree pattern (a class on disk ≠ Nest knowing
  about it; must be registered via `controllers`/`providers`/`imports`;
  `AppModule` is the root of a tree every feature module attaches into) —
  COLD CHECK PASSED 2026-09-03 from a blank-slate prompt (hypothetical
  `UsersModule`). Correctly sequenced: declare the module's own
  `controllers`/`providers` first, then import it into `AppModule` (or
  another module already in the tree). Promoted.
- Array update-in-place pattern (`.find()` for reading vs. `.findIndex()` +
  direct index assignment for actually persisting a change to an array of
  objects) — built and debugged live this session while implementing
  `updateTodo`/`deleteTodo`. The general shape (find → build a new/updated
  object → findIndex → assign back at that index) was reached with real
  scaffolding; see weak spots for the one sub-piece (raw array index
  assignment syntax) that needed a full reveal. Once shown, correctly
  self-applied the SAME missing-write-back diagnosis to both `updateTodo`
  and `deleteTodo` independently, and separately self-caught two more bugs
  in already-"fixed" code by tracing through what the return value would
  actually be (wrong variable written into the array; wrong variable
  returned to the caller) — real transfer within the session, not a
  one-off fix.
- `Array.prototype.push()` returns the new length, not the pushed item —
  stated directly (arbitrary fact), applied correctly afterward.
- TS `Omit<Todo, 'id'>` utility type used to type a "create" DTO without an
  `id` field — self-driven, unprompted, correctly transferred from React
  prop-typing experience with `Omit`/`Pick`.
- Nest parameter decorators `@Param()` / `@Body()` — extract a specific
  piece of the request (URL segment / JSON body) into a typed method
  parameter. Reached almost immediately via predict-then-verify: correctly
  guessed the underlying value is the same `req.params`/`req.body` he'd use
  in Express, just extracted declaratively. Fastest transfer of the
  session — this mechanism clearly maps onto solid prior knowledge.
- Nest HTTP verb decorators (`@Get`/`@Post`/`@Put`/`@Delete`) map 1:1 to
  REST verbs. Self-caught a real bug: had used `@Post(':id')` for BOTH
  `updateTodo` and `deleteTodo` (duplicate route), self-corrected to
  `@Put`/`@Delete` after a redirect question. Also made a sound, justified
  call to use `PUT` over the originally-planned `PATCH`, correctly
  reasoning that `updateTodo` does a full-object merge rather than a true
  partial update.
- Nest exception handling: `throw new NotFoundException()` (and friends,
  from `@nestjs/common`) is caught automatically by Nest's built-in global
  filter and turned into the correct HTTP status + JSON body — no manual
  per-layer status-code translation needed. Bridged from plain JS
  `throw`/`try-catch` (confirmed he knew both), anchored to a concrete,
  just-experienced example: a live JSON-parse error from Insomnia that
  produced a proper 400 without him writing any error-handling code for
  it. Needed real scaffolding to land correctly (see weak spots), but
  ended with a self-articulated, correct architectural principle: services
  should return plain domain values (`null`/`undefined` for "not found")
  and stay HTTP-agnostic; the controller's job is to translate those into
  HTTP-specific responses. He connected this back to his own existing
  code unprompted (service methods already returned `null` for
  update/delete).
- Soft-delete filtering — self-caught and self-fixed entirely
  independently, no prompting: `getTodos()` was returning deleted todos;
  added `.filter(todo => todo.status !== 'deleted')`. Found this himself
  during live testing, diagnosed it, and fixed it before reporting back.

## Shaky / weak spots (needs spaced review)
- Raw JS array index assignment (`arr[i] = x`) — total blank recall
  in-session despite claiming to have used it "a lot" before; needed a full
  rung-4 reveal via a simplified example, then rated 5/5 confidence
  post-reveal. He DID apply it correctly afterward (both in the original
  update/delete write-back, and later when self-diagnosing the two "which
  variable" bugs), so this looks like retrieval friction rather than a real
  gap — but worth a light, low-stakes spot-check next session to confirm.
- Nest exception/`throw` mechanism — landed correctly by the end, but
  needed multiple hint-ladder rungs: first attempt wrapped the check in a
  `try/catch` and used `return new NotFoundException()` instead of
  `throw new NotFoundException()` (which would have silently produced a
  200 with the exception object serialized as the body, not an actual
  404). Also initially didn't realize his own `catch` block would swallow
  a `throw` placed inside the same `try`, misrouting a 404 into a false
  500. Worth a genuinely cold check next session — e.g. "what happens if
  something several function calls deep throws an HttpException — does it
  need to be caught and re-thrown at each layer, or does it propagate on
  its own?" — to see if the mental model (vs. just the syntax) stuck.
- Design-reasoning/implementation consistency — recurring but mild pattern
  this session: twice stated a design principle correctly out loud
  (boolean `status` isn't scalable; ids shouldn't be hand-assigned) but the
  first code draft didn't match it (`completed: boolean`; and briefly
  `POST` body typed as full `Todo` including `id`). Both times he
  self-corrected fast once the mismatch was pointed out, and in the
  `Omit<Todo, 'id'>` case he'd already independently fixed the second one
  before it was flagged. Not concerning on its own, but worth a light
  "does your first draft match what you just said?" nudge if it recurs a
  third time in a future session.

## Mental models built
- Nest Module = a declarative composition root — same job as Express's
  `server.ts`, described via a decorator's config object instead of
  imperative code.
- Decorator = a function that attaches metadata to the class/method
  declared directly below it, read later by Nest.
- Nest DI container = the automated version of the `createAuth(pool)`
  pattern from Express: `providers` registers what's available, a
  constructor parameter's type declares what's wanted, the container
  matches, instantiates once (singleton), and injects the same instance
  everywhere — and critically, state loss is the concrete reason this
  matters, re-derivable per-service rather than a memorized fact about
  connections specifically.
- AppModule = root of a module tree. Every feature module attaches into
  some module's `imports` array, directly or transitively.
- Array-of-objects mutation = `.find()`/`.filter()` read without touching
  the array; actually changing a stored item requires `.findIndex()` to
  locate the position, then a direct index assignment (`arr[i] = newItem`)
  to write it back — a returned/spread copy floating in a variable is NOT
  connected to the array unless explicitly reassigned into it.
- Nest parameter decorators (`@Param`, `@Body`) = declarative shortcuts for
  digging into the raw Express `req` object (`req.params`, `req.body`) —
  same underlying data, just extracted for you at the framework level.
- Nest exception model = `throw`/`catch`, framework-flavored: throw one of
  Nest's built-in HTTP exception classes anywhere during a request, and a
  global filter (never hand-written) automatically converts it to the
  right HTTP status + JSON error body.
- Layering principle (self-articulated): services return plain domain
  values/signals; controllers translate those into HTTP-specific
  responses (status codes, thrown exceptions). Keeps services
  HTTP-agnostic and reusable outside the request/response cycle.

## Current focus
Just shipped the first complete feature end-to-end: `Todo` interface
(`id`, `title`, `description`, `status: 'pending' | 'completed' |
'deleted'`), `TodosService` (in-memory array, full CRUD, soft-delete via
status, a throwaway `this.todos.length + 1` id counter), and
`TodosController` (`GET /todos`, `GET /todos/:id`, `POST /todos`,
`PUT /todos/:id`, `DELETE /todos/:id`, all with proper 404 handling).
Manually verified live in Insomnia across the full flow, including two
bugs he found and fixed himself during that testing pass (an Insomnia
JSON-quoting mistake, and a missing soft-delete filter in `getTodos`).

## Next up (planned)
1. Wire up a real ORM (TypeORM or Prisma) to replace the in-memory array —
   first real ORM exposure, contrast against raw SQL from the Express
   project. This also naturally resolves the throwaway
   `this.todos.length + 1` id counter with real DB-generated ids.
2. Nest's default Jest scaffolding — first real testing exposure, now that
   there's real, working Todo logic worth testing against.
3. Auth (JWT) — deliberately deferred, stretch goal only after core CRUD +
   persistence.

## Review queue (resurface these in future warm-ups)
- Array index assignment / find-findIndex-write-back pattern — landed this
  session after a rung-4 reveal on the raw syntax; needs one light,
  low-stakes check next session to confirm it stuck.
- Nest exception/`throw` mechanism — introduced this session with real
  scaffolding; needs a genuinely cold check next session, ideally testing
  the underlying propagation model (not just "which decorator/class name"
  recall).
- Constructor injection / singleton scope — PASSED cold 2026-09-03 (2nd
  resurface, genuine re-derivation this time). Retire from tight rotation,
  spot-check occasionally.
- Module tree / AppModule-as-root generalization — PASSED cold 2026-09-03
  from a blank-slate prompt. Retire from tight rotation, spot-check
  occasionally.
- Decorators mechanism — retired, 2+ clean cold passes.
- Layered architecture + DI reasoning transfer — retired, established
  across multiple sessions and now further reinforced by the singleton
  item above.
