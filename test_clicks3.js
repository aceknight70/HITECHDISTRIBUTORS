import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allyBtn = buttons.find(b => b.textContent && b.textContent.includes('HubAlly'));
    if (allyBtn) {
      allyBtn.click();
      return true;
    }
    return false;
  });
  
  console.log('Clicked:', clicked);
  
  await new Promise(r => setTimeout(r, 1000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  if (html.includes('HubAlly Directory')) {
     console.log('FOUND MODAL IN HTML');
  } else {
     console.log('MODAL STILL MISSING');
  }
  
  await browser.close();
})();
