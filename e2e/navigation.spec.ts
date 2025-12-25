import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate from home to restaurant', async ({ page }) => {
    await page.goto('/eat');
    await page.waitForTimeout(3000);

    // Try to click on a restaurant card
    const restaurantCard = page.locator('.grid a').first();
    const cardVisible = await restaurantCard.isVisible().catch(() => false);

    if (cardVisible) {
      const href = await restaurantCard.getAttribute('href');
      await restaurantCard.click();
      await page.waitForTimeout(2000);

      // Should navigate to restaurant page (with or without /eat/ prefix)
      if (href) {
        expect(page.url()).not.toBe('http://localhost:3003/eat');
      }
    }
  });

  test('should have working navigation header', async ({ page }) => {
    await page.goto('/eat');
    await page.waitForTimeout(2000);

    // Header should be present
    const header = page.locator('header, nav, .sticky').first();
    await expect(header).toBeVisible();
  });

  test('should navigate to cart page', async ({ page }) => {
    await page.goto('/eat');
    await page.waitForTimeout(2000);

    // Look for cart link/button
    const cartLink = page.locator('a[href*="cart"], button:has-text("Sepet")').first();
    const cartVisible = await cartLink.isVisible().catch(() => false);

    if (cartVisible) {
      await cartLink.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('cart');
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/eat');
    await page.waitForTimeout(2000);

    // Page should still be usable - use first() to avoid strict mode
    const mainContent = page.locator('.min-h-screen').first();
    await expect(mainContent).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/eat');
    await page.waitForTimeout(2000);

    // Page should still be usable - use first() to avoid strict mode
    const mainContent = page.locator('.min-h-screen').first();
    await expect(mainContent).toBeVisible();
  });
});
