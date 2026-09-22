import { test, expect } from '@playwright/test';

const breed = 'mastiff';
const expectedSubBreed = 'english';

test(`sub-breeds of "${breed}" include "${expectedSubBreed}"`, {
  // Shown in the Monocart and HTML reports, so the reader sees what the test covers and where it comes from.
  annotation: [
    { type: 'requirement', description: `Fetch all sub-breeds for "${breed}" and validate "${expectedSubBreed}" is on the list` },
    { type: 'endpoint', description: `GET https://dog.ceo/api/breed/${breed}/list` },
  ],
}, async ({ request }) => {
  // Each check is its own step, so the reports show what was validated, not only that the test passed.
  // The steps run in order: the call is checked before the data, so a failure points at the right layer.

  const response = await test.step(`Fetch sub-breeds: GET breed/${breed}/list`, async () => {
    return request.get(`breed/${breed}/list`);
  });

  await test.step('HTTP status is 200', async () => {
    expect(response.status(), 'HTTP status').toBe(200);
  });

  const body = await test.step('Response is JSON with status "success"', async () => {
    expect(response.headers()['content-type'], 'Content-Type header').toContain('application/json');
    const json = await response.json();
    expect(json.status, 'API status field').toBe('success');
    return json;
  });

  // The sub-breeds are returned in "message", e.g. ["bull", "english", "indian", "tibetan"].
  const subBreeds: string[] = await test.step('"message" is a non-empty list of strings', async () => {
    const message = body.message;
    expect(Array.isArray(message), '"message" should be an array').toBe(true);
    expect(message.length, `"${breed}" should have at least one sub-breed`).toBeGreaterThan(0);
    for (const item of message) {
      expect(typeof item, `sub-breed ${JSON.stringify(item)} should be a string`).toBe('string');
    }
    return message;
  });

  // Print the list and attach it to the reports, so it is visible even when the test passes.
  console.log(`Sub-breeds of ${breed}: ${subBreeds.join(', ')}`);
  await test.info().attach(`Sub-breeds of ${breed}`, {
    body: JSON.stringify(subBreeds, null, 2),
    contentType: 'application/json',
  });

  // The requirement.
  await test.step(`Sub-breeds include "${expectedSubBreed}"`, async () => {
    expect(subBreeds, `sub-breeds of "${breed}" should include "${expectedSubBreed}"`)
      .toContain(expectedSubBreed);
  });
});
