import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  // Also log network requests that return 4xx or 5xx
  page.on('response', response => {
    if (!response.ok()) {
      console.log('RESPONSE FAIL:', response.url(), response.status());
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // print html body to see if it's empty
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
  console.log('HTML BODY:', html);

  await browser.close();
})();
