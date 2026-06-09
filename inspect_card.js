const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.route('**/courses/tutor-courses', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, title: 'Test Course', description: 'Short description for course.' },
        { id: 2, title: 'Long Description Course', description: 'Long description. '.repeat(30) }
      ]),
    });
  });
  await page.addInitScript(() => localStorage.setItem('token', 'dummy'));
  await page.goto('http://127.0.0.1:3001/my-courses.html');
  await page.waitForSelector('.course-card');

  const result = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.course-card'));
    return cards.map(card => ({
      html: card.innerHTML,
      cardStyle: getComputedStyle(card).cssText,
      contentStyle: card.querySelector('.course-content') ? getComputedStyle(card.querySelector('.course-content')).cssText : null,
      actionsStyle: card.querySelector('.course-actions') ? getComputedStyle(card.querySelector('.course-actions')).cssText : null,
      buttonStyle: card.querySelector('.action-btn') ? getComputedStyle(card.querySelector('.action-btn')).cssText : null,
      dom: {
        courseCard: card.outerHTML,
        content: card.querySelector('.course-content')?.outerHTML,
        actions: card.querySelector('.course-actions')?.outerHTML,
      }
    }));
  });
  await page.screenshot({ path: 'my-courses-card-debug.png', fullPage: true });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
