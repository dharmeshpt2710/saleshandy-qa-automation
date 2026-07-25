# Automation Coverage Summary

Maps every manual test case in [`Saleshandy-Test-Cases.docx`](Saleshandy-Test-Cases.docx) to the automated suite, and states plainly what is not automated and why.

Companion to [README.md](README.md), which covers setup, how to run, framework design and assumptions.

---

## At a glance

| | Count | Share |
| --- | ---: | ---: |
| Manual test cases written | 22 | |
| Fully automated | 11 | 50% |
| Partially automated | 3 | 14% |
| Manual only | 8 | 36% |

The suite is **17 Playwright tests across 4 files**: 14 functional tests plus 3 one-time account logins in the `setup` project.

| Area | Cases | Automated | Partial | Manual only |
| --- | ---: | ---: | ---: | ---: |
| Sign-up flow | 9 | 7 | 1 | 1 |
| Onboarding flow | 8 | 4 | 0 | 4 |
| Account-specific validations | 5 | 0 | 2 | 3 |

---

## 1. Sign-up flow

| Manual case | Test type | Status | Automated in | Tag |
| --- | --- | --- | --- | --- |
| TC-SU-01 Register with valid data and optional phone | Positive | Automated | `signup.spec.ts` | |
| TC-SU-02 Blocked when a required field is missing | Negative | Automated | `signup.spec.ts` | `@client` |
| TC-SU-03 Blocked when the password fails a policy rule | Negative | **Partial** | `signup.spec.ts` | `@client` |
| TC-SU-04 Email uniqueness and format boundaries | Edge | Manual only | | |
| TC-SU-05 Blocked on non-alphabetic characters in a name | Negative | Automated | `signup.spec.ts` | `@client` |
| TC-SU-06 Plus-addressed email rejected | Negative | Automated | `signup.spec.ts` | `@server` |
| TC-SU-07 Previously deleted account email rejected | Negative | Automated | `signup.spec.ts` | `@server` |
| TC-SU-08 Disposable email domain rejected | Negative | Automated | `signup.spec.ts` | `@server` |
| TC-SU-09 Blocked once max sign-up limit is reached | Edge | Automated, **skipped by default** | `signup.spec.ts` | `@server @ratelimit` |

**TC-SU-03 is partial.** The manual case covers four password data sets (no uppercase, no lowercase, no digit, under 8 characters). The automated test covers only the under-8-characters set. The other three assert against an inline requirement checklist whose per-rule state is not exposed as a stable, addressable element.

**TC-SU-09 is skipped on purpose.** Tripping the limit is the point of the case, but once tripped it fails TC-SU-01 and the entire onboarding spec until it lifts. It is kept as executable documentation and must be un-skipped and run in isolation.

---

## 2. Onboarding flow

| Manual case | Test type | Status | Automated in |
| --- | --- | --- | --- |
| TC-OB-01 Personal use onboarding completes | Positive | Automated | `onboarding.spec.ts` (personal) |
| TC-OB-02 Business onboarding completes | Positive | Automated | `onboarding.spec.ts` (business) |
| TC-OB-03 Clients onboarding completes | Positive | Automated | `onboarding.spec.ts` (clients) |
| TC-OB-04 A step cannot be passed without selecting an option | Negative | Manual only | |
| TC-OB-05 Back navigation preserves the earlier answer | Edge | Manual only | |
| TC-OB-06 Personal volume question matches the product choice | Edge | Manual only | |
| TC-OB-07 An unverified user can complete onboarding | Positive | Manual only | |
| TC-OB-08 A returning user is not shown onboarding again | Positive | Automated | `account-specific.spec.ts` (all 3 types) |

TC-OB-01, 02 and 03 are one parameterized test body executed once per account type, which is the direct proof that a single generic flow handles all three. `OnboardingPage.answerStep` asserts the step heading **and every expected option** before answering, so each run also verifies that the type is shown its own questions.

---

## 3. Account-specific validations

| Manual case | Test type | Status | Automated in |
| --- | --- | --- | --- |
| TC-AS-01 Each type is asked only its own steps | Negative | **Partial** | `onboarding.spec.ts` |
| TC-AS-02 Business is never asked a volume question | Negative | Manual only | |
| TC-AS-03 Landing dashboard follows the product choice | Positive | Manual only | |
| TC-AS-04 Account-specific UI on the dashboard reached | Positive | **Partial** | `account-specific.spec.ts` |
| TC-AS-05 Account type cannot be changed after onboarding | Edge | Manual only | |

**TC-AS-01 is partial.** Each account type's run asserts its own headings and options, so a type being shown a foreign question would fail. What is not automated is the explicit cross-comparison of the three recorded sets that the manual case describes.

**TC-AS-04 is partial.** `account-specific.spec.ts` confirms all three reusable accounts reach the Sequences dashboard and that it rendered, handling the conditional "Let's Start" gate. The Lead Finder side is not covered: `DashboardPage.expectLeadFinderDashboard()` exists but has no caller, because reaching Lead Finder requires a fresh sign-up answering "Lead finder" at the product step.

---

## Why the 8 manual-only cases are not automated

**Blocked by the sign-up rate limit (5 cases): TC-OB-05, TC-OB-06, TC-OB-07, TC-AS-02, TC-AS-03.**
Each needs one or more brand-new accounts, and every account burns a sign-up attempt permanently. TC-AS-03 alone needs five fresh accounts across different product choices, and TC-OB-06 needs three. With the live form currently returning the max-signup-limit message, these cannot be built and verified against the app. The page objects and data-driven step model would support them without structural change.

**Low automation value against cost (2 cases): TC-SU-04, TC-AS-05.**
TC-SU-04's duplicate-email sets need a known pre-existing account and burn addresses on every run, and its plus-addressing set is already covered by the automated TC-SU-06. TC-AS-05 is an exploratory sweep of every Settings section looking for an absent control, which is a weak fit for a scripted assertion.

**Automatable, deliberately deferred (1 case): TC-OB-04.**
Clicking the forward arrow with no option selected is straightforward to automate, but the arrow is icon-only with no accessible name and is only present on some steps, so it needs a more specific locator than the current `button:has(svg)`.

---

## Verification status against the live application

Not every automated test has been executed green, and it matters which.

**Executed and passing:**

| Tests | Result |
| --- | --- |
| TC-SU-02, TC-SU-03, TC-SU-05 (`@client`) | 3 passed |
| TC-OB-08, all three account types | 3 passed |
| Setup logins, all three accounts | 3 passed |

**Written, type-checked, but not yet verified against the live app:** TC-SU-01, TC-SU-06, TC-SU-07, TC-SU-08, TC-SU-09, TC-OB-01, TC-OB-02, TC-OB-03.

Every one of these requires creating a new account, and the live sign-up form is currently returning `You have hit max signup limit. Try again after some time.` for every address tried. This is an IP or account-level rate limit on the Saleshandy side, not a defect in the test data or selectors. See the Assumptions section of the README for the full list of email formats that were tried.

---

## Running a subset

```bash
npm test                              # everything (setup + all specs)
npx playwright test --grep @client    # fast, creates no accounts, burns no email
npx playwright test --grep @server    # submits for real, runs serially
```

| Tag | Meaning |
| --- | --- |
| `@client` | Asserts inline validation only. Never submits, so it creates no account. |
| `@server` | Submits the form. Each test costs one email address and one rate-limit attempt. |
| `@ratelimit` | Deliberately trips the sign-up limit. Skipped by default. |

---

## Known traceability gap

The onboarding tests are titled `TC-OB: <type> onboarding completes through all its steps` rather than carrying the per-type IDs TC-OB-01, TC-OB-02 and TC-OB-03 from the test case document. They map by account type as shown in the table above.
