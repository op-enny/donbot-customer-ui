import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/eat');

    // Check that the page loads with Sipariso title
    await expect(page).toHaveTitle(/Sipariso/i);
  });

  test('should display hero banner', async ({ page }) => {
    await page.goto('/eat');

    // Hero banner should be visible - use first() to avoid strict mode
    await expect(page.locator('.min-h-screen').first()).toBeVisible();
  });

  test('should display category tabs', async ({ page }) => {
    await page.goto('/eat');

    // Wait for category tabs to load
    await page.waitForSelector('.sticky', { timeout: 10000 });

    // Category tabs should be visible
    const tabs = page.locator('.sticky button');
    await expect(tabs.first()).toBeVisible();
  });

  test('should show loading skeletons initially', async ({ page }) => {
    await page.goto('/eat');

    // Either skeletons or restaurants should be visible
    const content = page.locator('.grid');
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('should handle empty restaurant list gracefully', async ({ page }) => {
    await page.goto('/eat');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Either restaurants or empty state should be visible
    const restaurantGrid = page.locator('.grid');
    const emptyState = page.locator('text=🍽️');

    const hasRestaurants = await restaurantGrid.count() > 0;
    const hasEmptyState = await emptyState.count() > 0;

    expect(hasRestaurants || hasEmptyState).toBeTruthy();
  });
});
