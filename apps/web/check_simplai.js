const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://simplai.ai', { waitUntil: 'load' });
  const styles = await page.evaluate(() => {

    // Find biggest header on page
    let maxH = 0;
    let mainH = null;
    document.querySelectorAll('h1, h2, h3, div, span').forEach(el => {
      const s = window.getComputedStyle(el);
      const f = parseFloat(s.fontSize);
      if (f > maxH) {
        maxH = f;
        mainH = el;
      }
    });

    const getS = (el) => {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return { fontSize: s.fontSize, fontWeight: s.fontWeight, color: s.color, cssText: s.cssText.substring(0, 100) };
    };

    return {
      biggestHeader: getS(mainH),
      bodyStyle: getS(document.body),
    };
  });
  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
