import { test, expect } from '@playwright/test';

test('Stencil Query Demo', async ({ page }) => {
  await test.step('Navigate to main page', async () => {
    await page.goto('/');

    const cmp = page.locator('my-component');
    await expect(cmp).toHaveClass(/hydrated/);
  });

  const card = page.locator('#card');
  const loader = page.locator('#loader');
  const content = page.locator('#content');
  const refreshButton = page.locator('#refresh-button');

  await test.step('Check initial loading state', async () => {
    await expect(card).toHaveAttribute('aria-busy', 'true');

    await expect(loader).toBeVisible();

    await expect(content).toBeHidden();

    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeDisabled();

    await expect(page.locator('body')).toMatchAriaSnapshot(`
      - main:
        - region "Query result":
          - heading "stencil-query" [level=2]
          - status: Fetching data…
          - button "Loading, please wait…" [disabled]: Refresh
    `);
  });

  await test.step('Check content being rendered', async () => {
    await expect(card).toHaveAttribute('aria-busy', 'false');

    await expect(loader).toBeHidden();

    await expect(content).toBeVisible();
    await expect(content).toContainText('IT WORKS ON MY MACHINE');

    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();

    await expect(page.locator('body')).toMatchAriaSnapshot(`
      - main:
        - region "Query result":
          - heading "stencil-query" [level=2]
          - status: IT WORKS ON MY MACHINE
          - button "Refresh query result": Refresh
    `);
  });

  await test.step('Check loading state after clicking refresh button', async () => {
    await refreshButton.click();

    await expect(loader).toBeVisible();

    await expect(content).toBeHidden();

    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeDisabled();

    await expect(page.locator('body')).toMatchAriaSnapshot(`
      - main:
        - region "Query result":
          - heading "stencil-query" [level=2]
          - status: Fetching data…
          - button "Loading, please wait…" [disabled]: Refresh
    `);
  });

  await test.step('Check content being rendered after refresh', async () => {
    await expect(card).toHaveAttribute('aria-busy', 'false');

    await expect(loader).toBeHidden();

    await expect(content).toBeVisible();
    await expect(content).toContainText(
      'HAVE YOU TRIED TURNING IT OFF AND ON AGAIN?',
    );

    await expect(refreshButton).toBeVisible();
    await expect(refreshButton).toBeEnabled();

    await expect(page.locator('body')).toMatchAriaSnapshot(`
      - main:
        - region "Query result":
          - heading "stencil-query" [level=2]
          - status: HAVE YOU TRIED TURNING IT OFF AND ON AGAIN?
          - button "Refresh query result": Refresh
    `);
  });
});
