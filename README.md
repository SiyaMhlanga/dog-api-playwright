# Dog API – Mastiff Sub-breeds (Playwright)

[![API tests](https://github.com/SiyaMhlanga/dog-api-playwright/actions/workflows/api-tests.yml/badge.svg)](https://github.com/SiyaMhlanga/dog-api-playwright/actions/workflows/api-tests.yml)

A small Playwright project with one API test.

## Requirement

> Using the pet store API https://dog.ceo/dog-api create a script that will fetch all the sub-breeds for a dog breed "mastiff", The script should validate that "english" is on the list of the sub-breeds returned on the response.

## What the test does

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

**Checks** (in [`tests/mastiff-sub-breeds.spec.ts`](tests/mastiff-sub-breeds.spec.ts))

1. The HTTP status is `200`.
2. The response `status` field is `"success"`.
3. `message` is a list that is not empty.
4. **The requirement:** `message` contains `"english"`.

The returned sub-breeds are printed to the console and attached to the HTML report, so you can see them even when the test passes.

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

Open the HTML report:

```bash
npm run report
```

## Expected output

```
Running 1 test using 1 worker

Sub-breeds of mastiff: bull, english, indian, tibetan
  ✓  1 tests/mastiff-sub-breeds.spec.ts:6:5 › sub-breeds of "mastiff" include "english" (261ms)

  1 passed (862ms)
```

If `"english"` were missing, the test fails and shows the full list it got back:

```
Error: sub-breeds of "mastiff" should include "english"

Expected value: "english"
Received array: ["bull", "indian", "tibetan"]
```

## Project structure

```
dog-api-playwright/
├── .github/workflows/api-tests.yml   # runs the test on every push and pull request
├── tests/mastiff-sub-breeds.spec.ts  # the test
├── playwright.config.ts              # base URL and reporters
├── package.json
└── README.md
```

## Design notes

- **Playwright's `request` fixture** sends the HTTP call directly, so no browser starts. The test finishes in under a second.
- **The call is checked before the data.** If the API is down or returns an error, the failure says so. You don't get a misleading "english not found" message.
- **Breed and sub-breed are constants** at the top of the spec. The test name and failure messages use them, so they read like the requirement. To check a different breed, change those two values.
- **The test uses the live API**, so it depends on dog.ceo being available.
- **CI:** GitHub Actions runs the test on every push and pull request and uploads the HTML report as an artifact.
