import { expect, test } from '@playwright/test';

test('dashboard renders vitals and records a synthetic event', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Web Vitals Lab' })).toBeVisible();
  await expect(page.getByTestId('correlation-id')).toContainText('correlation id:');
  await page.getByTestId('long-task').click();
  await expect(page.getByTestId('log')).toContainText('synthetic.long-task');
  await expect(page.getByTestId('metric-INP')).not.toContainText('—');
});
