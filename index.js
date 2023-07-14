const express = require("express");
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");

const app = express();

app.get("/", async (req, res) => {
  try {
    puppeteer.use(pluginStealth());
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath(),
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto("https://www.udemy.com");
    await page.waitForTimeout(1000);

    const ogTags = await page.evaluate(() => {
      const metaTags = Array.from(
        document.querySelectorAll('meta[property^="og:"]')
      );
      const ogData = {};
      metaTags.forEach((tag) => {
        const property = tag.getAttribute("property");
        const content = tag.getAttribute("content");
        ogData[property] = content;
      });
      return ogData;
    });

    await browser.close();

    res.json(ogTags);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

module.exports = app;
