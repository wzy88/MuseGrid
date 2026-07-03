const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByText('额度管理', { exact: true }).click();
  await page.waitForTimeout(400);
  let body = await page.locator('body').innerText();
  assert(body.includes('订阅与额度'), 'billing page should be reachable from sidebar quota entry');
  assert(body.includes('按月'), 'billing page should show monthly subscription');
  assert(body.includes('按季度'), 'billing page should show quarterly subscription');
  assert(body.includes('按年'), 'billing page should show annual subscription');
  assert(body.includes('收益中心'), 'billing page should explain monetization center');
  assert(body.includes('体验期模拟，不可提现'), 'billing page should clearly mark fake monetization as simulated');

  await page.getByRole('button', { name: /开通创作者版/ }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('创作者版'), 'demo upgrade should switch the subscription plan');
  assert(body.includes('生成额度'), 'billing page should show credit balance after upgrade');

  await page.getByText('申请入驻', { exact: true }).click();
  await page.waitForTimeout(300);
  await page.locator('input[placeholder="为你的分身起一个名字"]').fill('商业测试作词');
  await page.getByRole('button', { name: '下一步' }).click();
  await page.getByRole('button', { name: '下一步' }).click();
  await page.getByRole('button', { name: '下一步' }).click();
  await page.getByRole('button', { name: /完成创建/ }).click();
  await page.waitForTimeout(1200);
  body = await page.locator('body').innerText();
  assert(body.includes('自动发布'), 'created avatar should show auto-published review mode');
  assert(body.includes('可被召唤'), 'created avatar should be available for summoning immediately');

  await page.getByText('分身网络', { exact: true }).click();
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  assert(body.includes('商业测试作词'), 'auto-published avatar should appear in avatar network');

  await page.evaluate(() => {
    const snapshot = JSON.parse(localStorage.getItem('musegrid.v2.snapshot') || '{}');
    snapshot.billing = { planId: 'free', credits: 0, period: 'monthly' };
    localStorage.setItem('musegrid.v2.snapshot', JSON.stringify(snapshot));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '创作台' }).click();
  await page.locator('textarea').first().fill('测试额度不足时生成 Demo 的订阅拦截');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(300);

  for (const label of ['作词', '作曲', '编曲', '制作 Demo']) {
    await page.getByRole('button', { name: /召唤数字分身/ }).click();
    await page.getByRole('button', { name: /召唤推荐分身/ }).first().click();
    await page.waitForTimeout(900);
    await page.getByText(new RegExp(`确认${label}成果`)).click();
    await page.waitForTimeout(250);
  }
  await page.getByRole('button', { name: '生成最终 Demo' }).click();
  await page.waitForTimeout(400);
  body = await page.locator('body').innerText();
  assert(body.includes('额度不足'), 'final demo generation should be blocked when credits are insufficient');
  assert(body.includes('开通创作者版'), 'insufficient credits prompt should offer demo upgrade');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
