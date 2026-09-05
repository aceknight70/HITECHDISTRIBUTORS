import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allyBtn = buttons.find(b => b.textContent && b.textContent.includes('HubAlly'));
    if (allyBtn) {
      allyBtn.click();
    }
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log(html);
  
  await browser.close();
})();
