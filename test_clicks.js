import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  const hasAllyButton = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allyBtn = buttons.find(b => b.textContent && b.textContent.includes('HubAlly'));
    if (allyBtn) {
      return allyBtn.outerHTML.substring(0, 200);
    }
    return false;
  });
  
  console.log('Ally Button exists:', hasAllyButton);
  
  // Try to click it
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allyBtn = buttons.find(b => b.textContent && b.textContent.includes('HubAlly'));
    if (allyBtn) {
      allyBtn.click();
    }
  });
  
  // Wait a sec for modal
  await new Promise(r => setTimeout(r, 1000));
  
  const modalText = await page.evaluate(() => {
    return document.body.innerText.includes('HUBALLY DIRECTORY');
  });
  
  console.log('Modal appeared:', modalText);
  
  await browser.close();
})();
