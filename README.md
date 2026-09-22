# Dog API – Mastiff Sub-breeds (Playwright)

[![API tests](https://github.com/SiyaMhlanga/dog-api-playwright/actions/workflows/api-tests.yml/badge.svg)](https://github.com/SiyaMhlanga/dog-api-playwright/actions/workflows/api-tests.yml)

A small Playwright project with one API test, reported through the Playwright HTML report and a Monocart report.

## Requirement

> Using the pet store API https://dog.ceo/dog-api create a script that will fetch all the sub-breeds for a dog breed "mastiff", The script should validate that "english" is on the list of the sub-breeds returned on the response.

## What is being tested

**Endpoint**

```
GET https://dog.ceo/api/breed/mastiff/list
```

**Sample response**

```json
{
  "message": ["bull", "english", "indian", "tibetan"],
  "status": "success"
}
```

## Validation strategy

The test in [`tests/mastiff-sub-breeds.spec.ts`](tests/mastiff-sub-breeds.spec.ts) runs its checks as named steps, in this order. Each step appears by name in both reports, so you can see what was checked and not only that the test passed.

| # | Step (as shown in the report) | How it is validated | Why |
|---|---|---|---|
| 1 | `Fetch sub-breeds: GET breed/mastiff/list` | Playwright's `request` fixture sends the GET call. No browser starts. | The requirement is about API data, so a browser would only add time and flakiness. |
| 2 | `HTTP status is 200` | `expect(response.status()).toBe(200)` | Transport check. If the service is down, or the breed does not exist (Dog API returns `404`), the test stops here with a clear message. It does not go on to report a misleading "english not found". |
| 3 | `Response is JSON with status "success"` | The `Content-Type` header contains `application/json`, and the body's `status` field is `"success"`. | Dog API wraps every response in `{ status, message }`. A `200` with an error payload, or an HTML error page from a proxy or CDN, fails here, not at the parsing or data step. |
| 4 | `"message" is a non-empty list of strings` | `message` is an array, has at least one item, and every item is a string. | Contract check on the shape the requirement depends on. `toContain` on a string or `null` would give a confusing result or a false pass. An empty list means the data is wrong, not that "english" happens to be missing. |
| 5 | `Sub-breeds include "english"` | `expect(subBreeds).toContain('english')` | **The requirement.** This is an exact, case-sensitive match on the value the API returns. |

### Why this order matters

Each step only runs if the one before it passed. When the test fails, the failing step tells you which layer broke: network/HTTP, the API envelope, the response shape, or the business data. You don't need to open logs to tell an outage from a data change.

### What is deliberately *not* validated

- **The exact list of sub-breeds.** The requirement is that "english" is *on* the list. Asserting `["bull", "english", "indian", "tibetan"]` would fail if Dog API added a new mastiff sub-breed, even though the requirement would still be met. That would be a brittle test.
- **The order of the list.** The requirement doesn't mention order, and the API doesn't promise one.
- **Response time.** This is a functional test. A timing threshold against a public third-party API would fail because of network conditions, not the API.
- **A full JSON schema.** The response has two fields. Inline checks on the fields the requirement uses are clearer than adding a schema library.

### Evidence in the reports

- The returned sub-breeds are printed to the console and attached as `Sub-breeds of mastiff` (JSON), so the actual data is visible even when the test passes.
- The test carries two annotations, `requirement` and `endpoint`, that link the result back to the requirement above.
- On failure, the assertion message states the expectation in plain English and Playwright prints the received value. For example:

```
1) › sub-breeds of "mastiff" include "english" › Sub-breeds include "english"

   Error: sub-breeds of "mastiff" should include "english"

   Expected value: "english"
   Received array: ["bull", "indian", "tibetan"]
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- Internet access, because the test calls the live Dog API

You don't need to install a browser. The test only makes HTTP calls.

## Run it

```bash
git clone https://github.com/SiyaMhlanga/dog-api-playwright.git
cd dog-api-playwright
npm install
npm test
```

### Expected output

```
Running 1 test using 1 worker

Sub-breeds of mastiff: bull, english, indian, tibetan
  ✓  1 tests/mastiff-sub-breeds.spec.ts:6:5 › sub-breeds of "mastiff" include "english" (420ms)

  1 passed (1.1s)
```

Monocart also prints a summary table to the console at the end of the run.

## Reports

Every run produces two reports:

| Report | Location | Open with |
|---|---|---|
| Monocart | `monocart-report/index.html` | `npm run report:monocart` |
| Playwright HTML | `playwright-report/index.html` | `npm run report` |

**Monocart** is the one to start with. It shows the test, its annotations, each named step with its duration and status, the console output and the attached sub-breed list, all in one view. It is a single file, so it is easy to share.

The Playwright HTML report shows the same steps and attachment in Playwright's standard format.

In CI, both reports are uploaded as build artifacts (`monocart-report` and `playwright-report`) on every run, including failed runs.

## Project structure

```
dog-api-playwright/
├── .github/workflows/api-tests.yml   # runs the test on every push and pull request, uploads both reports
├── tests/mastiff-sub-breeds.spec.ts  # the test
├── playwright.config.ts              # base URL and reporters (list, HTML, Monocart)
├── package.json
└── README.md
```

## Design notes

- **Breed and sub-breed are constants** at the top of the spec. The test name, step names and failure messages all use them, so they read like the requirement. To check a different breed, change those two values.
- **`baseURL` ends with a slash** (`https://dog.ceo/api/`), so the test can use the relative path `breed/mastiff/list`. The environment is configured in one place.
- **The test uses the live API** on purpose. The point is to check what dog.ceo actually returns. The trade-off is that the test depends on dog.ceo being available. In CI a single retry absorbs a one-off network error, and a real outage fails at step 2 with a message that says so.
- **Run artifacts go to the OS temp folder**, not the project folder. OneDrive and similar synced folders can lock files while Playwright is still writing them.
- **CI:** GitHub Actions runs the test on every push and pull request. `forbidOnly` stops a stray `test.only` from being committed.
