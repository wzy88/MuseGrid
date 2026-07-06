const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4327/';

  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const topThemeButton = page.getByRole('button', { name: /切换到(浅灰|深色)主题/ });
  assert(await topThemeButton.count() === 1, 'top-right area should expose exactly one theme toggle button');

  const visibleNames = page.getByText('张浩');
  assert(await visibleNames.count() === 1, 'user identity should appear only in the bottom-left user area');

  const initialTheme = await page.locator('[data-theme-mode]').getAttribute('data-theme-mode');
  assert(initialTheme === 'deep' || initialTheme === 'light', 'app root should expose the current theme mode');
  await topThemeButton.click();
  await page.waitForTimeout(200);
  const toggledTheme = await page.locator('[data-theme-mode]').getAttribute('data-theme-mode');
  assert(toggledTheme && toggledTheme !== initialTheme, 'theme toggle should switch the active theme mode');

  const userChip = page.getByRole('button', { name: /张浩.*普通用户.*Lv2/ });
  assert(await userChip.count() === 1, 'bottom-left user chip should be a single interactive account entry');
  await userChip.click();
  await page.waitForTimeout(200);

  const accountPanel = page.getByLabel('账户概览');
  assert(await accountPanel.isVisible(), 'clicking the user chip should open the account panel');
  assert(await accountPanel.getByText('可用额度', { exact: true }).isVisible(), 'account panel should show available credits');
  assert(await accountPanel.getByText('作品', { exact: true }).isVisible(), 'account panel should show works count');
  assert(await accountPanel.getByText('分身', { exact: true }).isVisible(), 'account panel should show avatar count');

  await page.getByRole('button', { name: '分身管理' }).last().click();
  await page.waitForTimeout(200);
  assert((await page.locator('body').innerText()).includes('分身管理'), 'account panel should navigate to avatar management');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
