const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const urls = [
    'http://localhost:5173/',
    'http://localhost:5173/dashboard',
    'http://localhost:5173/upload',
    'http://localhost:5173/library',
    'http://localhost:5173/findings',
    'http://localhost:5173/reports',
    'http://localhost:5173/risk',
    'http://localhost:5173/executive',
    'http://localhost:5173/profile',
    'http://localhost:5173/login',
  ];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`PAGE EXCEPTION: ${error.message}`);
  });

  for (const url of urls) {
    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 5000 });
      console.log(`Successfully loaded ${url}`);
    } catch (e) {
      console.log(`Error loading ${url}: ${e.message}`);
    }
  }

  await browser.close();
})();
