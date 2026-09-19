const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();

  const page = await browser.newPage({
    viewport: {
      width: 1440,
      height: 900,
    },
    deviceScaleFactor: 1,
  });

  console.log("Opening portfolio...");

  await page.goto("https://ihebtrabelsii.github.io/Portfolio/", {
    waitUntil: "networkidle",
  });

  console.log("Page loaded.");

  // Let fonts, images and animations load
  await page.waitForTimeout(2000);

  console.log("Triggering scroll animations...");

  // Slowly scroll through the entire website
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const distance = 400;
      const delay = 150;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);

        if (
          window.innerHeight + window.scrollY >=
          document.body.scrollHeight
        ) {
          clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  });

  // Give animations time to finish
  await page.waitForTimeout(3000);

  // Return to top
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });

  await page.waitForTimeout(1000);

  if (!fs.existsSync("screenshots")) {
    fs.mkdirSync("screenshots");
  }

  console.log("Taking screenshot...");

  await page.screenshot({
    path: "screenshots/portfolio-full.png",
    fullPage: true,
  });

  console.log("🔥 DONE!");
  console.log("Saved to screenshots/portfolio-full.png");

  await browser.close();
})();