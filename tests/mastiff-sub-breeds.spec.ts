import { test, expect } from '@playwright/test';

const breed = 'mastiff';
const expectedSubBreed = 'english';

test(`sub-breeds of "${breed}" include "${expectedSubBreed}"`, async ({ request }) => {
  // Fetch all sub-breeds for the breed: GET https://dog.ceo/api/breed/mastiff/list
  const response = await request.get(`breed/${breed}/list`);

  // Check the call itself worked before looking at the data,
  // so a failure points at the right layer.
  expect(response.status(), 'HTTP status').toBe(200);
  const body = await response.json();
  expect(body.status, 'API status field').toBe('success');

  // The sub-breeds are returned in "message", e.g. ["bull", "english", "indian", "tibetan"].
  const subBreeds: string[] = body.message;
  expect(Array.isArray(subBreeds) && subBreeds.length > 0, `"${breed}" should return a list of sub-breeds`)
    .toBe(true);

  // Print the list and attach it to the HTML report, so it is visible even when the test passes.
  console.log(`Sub-breeds of ${breed}: ${subBreeds.join(', ')}`);
  await test.info().attach(`Sub-breeds of ${breed}`, {
    body: JSON.stringify(subBreeds, null, 2),
    contentType: 'application/json',
  });

  // The requirement.
  expect(subBreeds, `sub-breeds of "${breed}" should include "${expectedSubBreed}"`)
    .toContain(expectedSubBreed);
});
