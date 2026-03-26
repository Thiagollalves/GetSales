const { spawn } = require("child_process");
const { chromium } = require("playwright");
const http = require("http");

const devUrl = "http://127.0.0.1:3000";
const screenshotDir = process.cwd();

const waitForServer = (url, timeoutMs = 60000) =>
  new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const check = () => {
      const req = http.get(url, (res) => {
        res.destroy();
        resolve();
      });

      req.on("error", (error) => {
        req.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Falha ao acessar ${url}: ${error.message}`));
        } else {
          setTimeout(check, 1000);
        }
      });

      req.setTimeout(3000, () => {
        req.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Timeout aguardando ${url}`));
        } else {
          setTimeout(check, 1000);
        }
      });
    };

    check();
  });

const take = async (page, filename) => {
  await page.screenshot({ path: `${screenshotDir}/${filename}`, fullPage: true });
};

(async () => {
  const server = spawn("cmd.exe", ["/c", "npm.cmd", "run", "dev"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
    windowsHide: true,
  });

  server.stdout.on("data", (chunk) => process.stdout.write(`[dev] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[dev] ${chunk}`));

  const stopServer = () => {
    try {
      server.kill();
    } catch (error) {
      console.warn("Falha ao encerrar servidor", error);
    }
  };

  try {
    await waitForServer(devUrl, 90000);

    const browser = await chromium.launch({ headless: true });
    try {
      const desktopContext = await browser.newContext({ viewport: { width: 1400, height: 900 } });
      const page = await desktopContext.newPage();

      await page.goto(`${devUrl}/dashboard/pipeline`, { waitUntil: "networkidle" });
      await page.waitForTimeout(2000);
      await take(page, "qa-dashboard-pipeline-desktop.png");

      await page.fill('input[placeholder="Buscar lead..."]', "zzzzzz");
      await page.waitForTimeout(700);
      await take(page, "qa-pipeline-search-dead.png");

      await page.goto(devUrl, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      await take(page, "qa-landing-desktop.png");

      await desktopContext.close();

      const pipelineMobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      const pipelineMobilePage = await pipelineMobileContext.newPage();
      await pipelineMobilePage.goto(`${devUrl}/dashboard/pipeline`, { waitUntil: "networkidle" });
      await pipelineMobilePage.waitForTimeout(2000);
      await take(pipelineMobilePage, "qa-dashboard-mobile.png");
      await pipelineMobileContext.close();

      const landingMobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      const landingMobilePage = await landingMobileContext.newPage();
      await landingMobilePage.goto(devUrl, { waitUntil: "networkidle" });
      await landingMobilePage.waitForTimeout(1000);
      await take(landingMobilePage, "qa-landing-mobile.png");
      await landingMobileContext.close();

      const inboxContext = await browser.newContext({ viewport: { width: 1400, height: 900 } });
      const inboxPage = await inboxContext.newPage();
      await inboxPage.goto(`${devUrl}/dashboard/inbox`, { waitUntil: "networkidle" });
      await inboxPage.waitForTimeout(1500);
      await inboxPage.getByRole("button", { name: /nova conversa/i }).click();
      await inboxPage.waitForTimeout(500);
      await inboxPage.fill('input[placeholder="Buscar conversas..."]', "Novo");
      await inboxPage.waitForTimeout(500);
      await take(inboxPage, "qa-inbox-search-and-new-conversation.png");
      await inboxContext.close();
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    stopServer();
  }
})();
