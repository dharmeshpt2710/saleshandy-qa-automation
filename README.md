# Saleshandy SDET Assignment

End-to-end test automation for the Saleshandy sign-up and onboarding flows across the three account types the product supports: **Personal Use**, **Business**, and **Clients**.

The core idea of the assignment is that each account type has its own sign-up form, its own onboarding questions, and its own post-onboarding UI, but there should be **one generic, parameterized flow** that handles all three based on the account type passed in. That is exactly how this framework is built: the flow logic is written once, and only the data (which questions, which answers) changes per account type.

- **App under test:** https://my.saleshandy.com/
- **Tool:** Playwright with TypeScript
- **Browser:** Chromium

---

## Tools and technologies used

| Purpose | Choice |
| --- | --- |
| Test runner / automation | [Playwright](https://playwright.dev/) (`@playwright/test`) |
| Language | TypeScript |
| Runtime | Node.js |
| Config / secrets | `dotenv` (`.env` file, git-ignored) |
| Reporting | Playwright HTML reporter |
| CI | GitHub Actions (`.github/workflows/playwright.yml`) |
| Exploratory testing notes | Otter.ai (voice capture during manual sessions) |
| AI assistance | Claude Code (scaffolding, refactoring, review) |

---

## Approach

Behaviour was established by hand before any of it was automated.

1. **Exploratory testing.** Every flow was walked manually across all three account types first. Otter.ai ran during those sessions to capture a spoken commentary, so findings were recorded as they happened instead of being reconstructed from memory afterwards.
2. **Test case design.** Those notes became the 22 manual cases in [`Saleshandy-Test-Cases.docx`](Saleshandy-Test-Cases.docx), covering positive, negative, edge and account-type-specific scenarios.
3. **Automation.** The important cases were automated against behaviour already confirmed by hand, which is why the suite asserts exact product strings rather than generic "an error appears" checks.
4. **Coverage review.** Every manual case was then mapped back to the suite in [`COVERAGE.md`](COVERAGE.md), including the ones deliberately left manual and why.

Nothing here is asserted from guesswork. The plus-addressing rejection, the blacklisted disposable domains, the refusal to reuse a deleted account's email, the IP-level sign-up limit, the conditional "Let's Start" gate on the Sequences dashboard, and the Personal-only volume question that branches on product choice were all discovered through manual testing, then encoded as assertions.

Claude Code was used throughout for scaffolding, refactoring and review, per the assignment's allowance for an AI assistance tool. The engineering decisions it implements are deliberate and documented: what belongs in a page object, which tests are allowed to submit the form, and what is skipped rather than run.

---

## Project setup

**Prerequisites:** Node.js (LTS) and npm.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install the Playwright browser (Chromium):

   ```bash
   npx playwright install chromium
   ```

3. Create your `.env` from the template and fill in the three pre-created accounts:

   ```bash
   cp .env.example .env
   ```

   ```dotenv
   PERSONAL_EMAIL=
   PERSONAL_PASSWORD=

   BUSINESS_EMAIL=
   BUSINESS_PASSWORD=

   CLIENTS_EMAIL=
   CLIENTS_PASSWORD=

   DELETED_ACCOUNT_EMAIL=
   ```

   The first three are the long-lived accounts (one per account type) that the suite logs into once and reuses. `.env` is git-ignored, so real credentials are never committed. See [Avoiding repeated login](#avoiding-repeated-login-assignment-43) for why these accounts exist.

   `DELETED_ACCOUNT_EMAIL` is a real inbox that was signed up and then permanently deleted; `TC-SU-07` asserts the form refuses to sign it up again. It lives in `.env` rather than in the repo because it is a personal address.

---

## How to run the tests

The tests run in **headed** mode on purpose, because logging in requires a one-time OTP that a person types into the browser (see [Assumptions](#assumptions)).

```bash
# Run the whole suite (setup + all specs)
npm test

# Same, but explicitly headed
npm run test:headed

# Open the HTML report from the last run
npm run report

# Type-check without running anything
npm run typecheck
```

`npm test` is a single command even though logging in and testing are two phases. Playwright runs the `setup` project first (it signs into the three accounts and saves their sessions), then the `chromium` project runs the real specs against those saved sessions. The dependency between them is declared in `playwright.config.ts`, so you never run login manually.

**Forcing a fresh login.** Saved sessions are trusted for 8 hours. If a session has expired and tests start bouncing back to `/login`, force a new login:

```bash
# macOS / Linux
FORCE_LOGIN=1 npm test
```

```powershell
# Windows PowerShell
$env:FORCE_LOGIN=1; npm test
```

---

## Framework structure

```
saleshandy-sdet-assignment/
├── playwright.config.ts        # 2 projects: "setup" (login once) then "chromium" (real tests)
├── .env.example                # template for the 3 reusable account credentials
├── .github/workflows/          # GitHub Actions CI
├── .auth/                      # saved login sessions per account (git-ignored, created at runtime)
│
├── src/
│   ├── types.ts                # AccountType, TestUser, LoginCredentials
│   │
│   ├── data/                   # the ONLY place the three flows differ
│   │   ├── onboardingData.ts   #   onboarding questions/answers per account type
│   │   ├── userData.ts         #   sign-up user builder + Gmail dot-variant email generator
│   │   └── credentials.ts      #   reads the 3 accounts from .env
│   │
│   ├── pages/                  # Page Objects (private locators, actions, expect* methods)
│   │   ├── SignUpPage.ts
│   │   ├── LoginPage.ts
│   │   ├── OnboardingPage.ts   #   one generic driver for all account types
│   │   └── DashboardPage.ts
│   │
│   ├── auth/
│   │   └── signUp.ts           # one generic sign-up + onboarding flow, parameterized by account type
│   │
│   ├── fixtures/
│   │   └── index.ts            # custom fixture: test.use({ account }) loads that account's session
│   │
│   └── utils/
│       ├── constants.ts        # shared paths, card text, selectors, error messages
│       └── helpers.ts          # navigation + assertion helpers, session path / freshness logic
│
└── tests/
    ├── auth.setup.ts           # logs into each account once, saves session under .auth/
    ├── signup.spec.ts          # sign-up form: positive + negative
    ├── onboarding.spec.ts      # full fresh sign-up + onboarding, one run per account type
    └── account-specific.spec.ts# reuses saved sessions, asserts account-specific state
```

### Assertion convention

Locators are `private` to their page object. Nothing outside a page object touches a raw `Locator`, so a selector change never reaches a spec.

Assertions come in two layers:

- **`src/utils/helpers.ts`** wraps the Playwright matchers as `expectVisible`, `expectHidden`, `expectUrl`, `expectDisabled`, `expectEnabled`, `expectContainsText`, and `expectCount`. Changing a matcher is a one-line edit here.
- **Page objects** expose `expect*` methods named after the business rule, not the matcher: `expectSignUpBlocked()`, `expectServerError(message)`, `expectAccountTypeScreen(type)`. A spec reads as requirements, and the method stays truthful if the UI changes how it expresses the rule (a disabled button becoming a hidden one, say).

The specs therefore import `test` only. They never import `expect`.

### How the "one generic flow" requirement is met

The assignment asks for a single reusable sign-up flow parameterized by account type, not three separate scripts. This is implemented in two layers:

- **`src/auth/signUp.ts`** exposes `signUp(page, accountType)`. Pass `'personal'`, `'business'`, or `'clients'` and it fills the form, picks the matching account card, and answers that type's onboarding steps.
- **`src/data/onboardingData.ts`** is the only place the three flows differ. Each account type maps to an ordered list of steps (`heading`, the `options` to assert, and the `answer` to click). The `OnboardingPage` page object just loops over whichever list it is given, so adding or changing a question is a data edit, not a code change.

Because of this, `onboarding.spec.ts` and `account-specific.spec.ts` each run the **same** test body once per account type in a loop, which is the direct proof that one flow handles all three.

---

## Avoiding repeated login (assignment 4.3)

Logging into Saleshandy triggers a 4-digit OTP sent to the account's email, which cannot be automated end to end. Repeating that for every test would be slow and would need a human every time. The framework avoids it like this:

1. **Login happens in a dedicated setup project, not in the tests.** `tests/auth.setup.ts` runs first (declared as a dependency of the `chromium` project in `playwright.config.ts`). It logs into each of the three accounts once and saves the browser session with `storageState()` to `.auth/<account>.json`.

2. **Tests reuse the saved session instead of logging in.** The custom fixture in `src/fixtures/index.ts` lets a spec say `test.use({ account: 'business' })`, and it points Playwright's `storageState` at that account's saved session. The test starts already authenticated and already onboarded, so there is no login inside the test at all.

3. **Login is not even repeated across runs.** `hasFreshSession()` in `src/utils/helpers.ts` skips the login in setup when a saved session file is younger than 8 hours. So on back-to-back runs, setup logs in zero times and the OTP is not needed at all. `FORCE_LOGIN=1` overrides this when a session has genuinely expired.

4. **One account per type, created once and reused.** An account's type is fixed once it is onboarded, so the three reusable accounts are created by hand a single time and their credentials live in `.env`. The suite only ever logs into them, it never re-creates them.

The result maps directly to the 4.3 checklist: login is not repeated in every test, a user is created once and reused, tests run faster (they skip both login and onboarding), and the whole thing is a small amount of well-scoped code (one setup file, one fixture, one helper).

---

## Test coverage

| Spec | Scenario | Type | Runs per account type |
| --- | --- | --- | --- |
| `signup.spec.ts` | New user can sign up with valid data and an optional phone number (`TC-SU-01`) | Positive | Personal only |
| `signup.spec.ts` | Required fields show inline errors, sign up stays disabled (`TC-SU-02`) | Negative, `@client` | Personal only |
| `signup.spec.ts` | Password under 8 characters keeps sign up disabled (`TC-SU-03`) | Negative, `@client` | Personal only |
| `signup.spec.ts` | Non-alphabetic characters in the name fields are rejected (`TC-SU-05`) | Negative, `@client` | Personal only |
| `signup.spec.ts` | Plus-addressed email is rejected (`TC-SU-06`) | Negative, `@server` | Personal only |
| `signup.spec.ts` | Email of a previously deleted account is rejected (`TC-SU-07`) | Negative, `@server` | Personal only |
| `signup.spec.ts` | Disposable email domain is rejected (`TC-SU-08`) | Negative, `@server` | Personal only |
| `signup.spec.ts` | Sign-up blocked once the max signup limit is hit (`TC-SU-09`) | Negative, `@ratelimit`, **skipped** | Personal only |
| `onboarding.spec.ts` | Full onboarding completes through every step (`TC-OB`) | Positive | Personal, Business, Clients |
| `account-specific.spec.ts` | An onboarded user lands on the Sequences dashboard and is not shown onboarding again (`TC-OB-08`) | Account-specific | Personal, Business, Clients |

### How the sign-up spec is grouped

`signup.spec.ts` nests its cases in `test.describe` blocks that reflect what each case actually costs:

- **`client-side validation` (`@client`)** never submits the form. These assert inline field errors and the disabled state of the sign-up button, so they create no account, burn no email address, and run fully in parallel.
- **`server-side rejection` (`@server`)** submits the form for real, so every case consumes one Gmail dot-variant and one attempt against Saleshandy's sign-up rate limit. The block is `test.describe.configure({ mode: 'serial' })` so the cases don't race each other into that limit.

Run one group on its own with a tag:

```bash
npx playwright test --grep @client     # fast, no accounts created
npx playwright test --grep @server     # submits for real, serial
```

**`TC-SU-09` is skipped by default.** Tripping the max-signup limit is the point of that test, but once tripped it fails `TC-SU-01` and the whole of `onboarding.spec.ts` until the limit lifts. It is kept in the suite as executable documentation of the behaviour, tagged `@ratelimit`, and must be un-skipped deliberately and run in isolation.

`TC-SU-04` has no automated test. It covers email uniqueness and format boundaries, which need a known pre-existing account and burn an address on every run, and its plus-addressing set is already covered by `TC-SU-06`. It stays in the test case document as a manual-only edge case.

The onboarding spec asserts every option on every step is visible before answering, so it doubles as an account-specific UI check: a Personal run only ever sees Personal questions, and so on.

### Deliverables

- **Test case document:** [`Saleshandy-Test-Cases.docx`](Saleshandy-Test-Cases.docx), 22 manual cases across sign-up, onboarding and account-specific validations.
- **Automation coverage summary:** [`COVERAGE.md`](COVERAGE.md), mapping every manual case to automated, partial or manual-only, with the reason for each gap and the current verification status against the live app.

> **Note on the sign-up path (as of 2026-07-25).** The live sign-up form is currently returning `"You have hit max signup limit. Try again after some time."` for every email address tried. This is an IP / account-level rate limit on the Saleshandy side, not a problem with the test data or selectors. While it is in effect, the specs that create a brand-new account (`signup.spec.ts` and `onboarding.spec.ts`) cannot be run end to end against the live app, and the Business and Clients onboarding steps in particular remain unverified against production UI. The code, page objects, and data for those flows are in place and follow the same verified pattern as the account-specific specs; they are expected to pass once sign-up access is restored. The account-specific specs (`account-specific.spec.ts`) are unaffected, because they reuse the pre-created accounts and never sign up.

---

## Assumptions

- **OTP is entered by a human during setup.** Login sends a 4-digit code to the account email, and the inbox is not readable from the tests. When the setup phase runs (only when there is no fresh session), it pauses on the verification screen and prints a prompt; you type the code into the open browser and it continues. This is why the suite runs headed.
- **The three reusable accounts already exist and are fully onboarded.** Their type cannot be changed after onboarding, so they are set up once by hand. `account-specific.spec.ts` relies on them being past onboarding.
- **Sign-up is rate-limited on the server side right now, and no email variant gets around it.** Every address format was tried: plus-addressing (`name+tag@gmail.com`, rejected as a bad email), a unique random/timestamp suffix (rejected as a bad email because it is not a real inbox), and genuine Gmail dot-variants (which the form does accept). Even with valid dot-variants, the live form now rejects every registration with a max-signup-limit message (see the note under [Test coverage](#test-coverage)). This confirms the block is an IP / account-level rate limit on Saleshandy's side, not something a different email could fix. The sign-up and onboarding specs are therefore built and reviewed against the flow but not verified end to end against the live app until that limit lifts.
- **Sign-up email addresses use Gmail dot-variants.** `src/data/userData.ts` generates fresh variants of one Gmail address (Gmail ignores dots, so they all reach the same inbox, but Saleshandy treats each as a new address). Each variant used to sign up is effectively burned, since Saleshandy will reject it on a later run.
- **Which dashboard appears after onboarding depends on the product choice, not the account type.** Choosing "Lead Finder" lands on the Lead Finder dashboard; everything else lands on Sequences. The current flows all answer "Cold outreach", so they land on Sequences.
- **Chromium only.** The config runs a single browser project to keep runs fast. Cross-browser was out of scope for this assignment.
- **Selectors lean on visible text and roles.** The app exposes few stable test ids, so locators use placeholder text, roles, and card text (several taken from Playwright codegen). Shared strings and selectors are centralized in `src/utils/constants.ts` so a UI wording change is a one-line edit.
