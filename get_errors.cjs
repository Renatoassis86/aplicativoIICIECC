const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173');
  console.log("Navigated to app...");
  
  // Wait for the login screen to render
  await page.waitForSelector('input[type="text"]');
  console.log("Found CPF input...");
  
  await page.type('input[type="text"]', '12345678909');
  await page.type('input[type="password"]', 'congresso2026');
  
  console.log("Clicking login...");
  const buttons = await page.$$('button[type="submit"]');
  await buttons[0].click(); // Press the primary login button
  
  // Wait 4 seconds to observe any unhandled react mounts mapping crashes
  await new Promise(r => setTimeout(r, 4000));
  
  await browser.close();
  console.log("Done checking for errors.");
})();
