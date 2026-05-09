/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("child_process")
const { join } = require("path")
const http = require("http")
const crypto = require("node:crypto")
const { chromium } = require("playwright")

const devHost = "127.0.0.1"
const screenshotDir = process.cwd()
const contactsFixturePath = join(process.cwd(), "tests", "fixtures", "leads-jet-sales-brasil-api-oficial.xlsx")
const adminUsername = process.env.ADMIN_ACCESS_USERNAME?.trim() || "admin"
const adminPassword = process.env.ADMIN_ACCESS_TOKEN?.trim() || "123456"
const adminCookieName = "getsales_admin_session"
const sessionPrefix = "v1"

const waitForServer = (url, timeoutMs = 60000) =>
  new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs

    const check = () => {
      const req = http.get(url, (res) => {
        res.destroy()
        resolve()
      })

      req.on("error", (error) => {
        req.destroy()
        if (Date.now() > deadline) {
          reject(new Error(`Falha ao acessar ${url}: ${error.message}`))
        } else {
          setTimeout(check, 1000)
        }
      })

      req.setTimeout(3000, () => {
        req.destroy()
        if (Date.now() > deadline) {
          reject(new Error(`Timeout aguardando ${url}`))
        } else {
          setTimeout(check, 1000)
        }
      })
    }

    check()
  })

const take = async (page, filename) => {
  await page.screenshot({ path: `${screenshotDir}/${filename}`, fullPage: true })
}

const openDialogAndCapture = async (page, trigger, dialogTitle, filename) => {
  await trigger.click()
  await page.getByRole("heading", { name: dialogTitle, exact: true }).waitFor({ state: "visible" })
  await take(page, filename)
}

const createAdminSessionToken = (username, password) => {
  const normalizedUsername = username.trim()
  const normalizedPassword = password.trim()
  const encodedUsername = Buffer.from(normalizedUsername, "utf8").toString("base64url")
  const payload = `${sessionPrefix}.${encodedUsername}`
  const signature = crypto.createHmac("sha256", normalizedPassword).update(payload).digest("base64url")

  return `${payload}.${signature}`
}

const createAuthorizedContext = async (browser, options, devUrl) => {
  const context = await browser.newContext(options)
  await context.addCookies([
    {
      name: adminCookieName,
      value: createAdminSessionToken(adminUsername, adminPassword),
      url: devUrl,
      httpOnly: true,
      sameSite: "Lax",
      secure: false,
    },
  ])

  return context
}

const startDevServer = () => {
  const server = spawn("cmd.exe", ["/c", "npm.cmd", "run", "dev"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, HOST: devHost, HOSTNAME: devHost },
    windowsHide: true,
  })

  let bufferedOutput = ""
  let resolved = false

  const devUrlPromise = new Promise((resolve, reject) => {
    const resolveFromOutput = (chunk, stream) => {
      const text = chunk.toString()
      process[stream].write(`[dev] ${text}`)
      bufferedOutput += text

      if (resolved) {
        return
      }

      const match = bufferedOutput.match(/Local:\s+http:\/\/(?:localhost|127\.0\.0\.1):(\d+)/)
      if (match) {
        resolved = true
        resolve(`http://${devHost}:${match[1]}`)
      }
    }

    server.stdout.on("data", (chunk) => resolveFromOutput(chunk, "stdout"))
    server.stderr.on("data", (chunk) => resolveFromOutput(chunk, "stderr"))
    server.on("error", (error) => {
      if (!resolved) {
        reject(error)
      }
    })
    server.on("exit", (code, signal) => {
      if (!resolved) {
        reject(new Error(`Dev server exited before reporting its URL (code ${code}, signal ${signal})`))
      }
    })
  })

  return { server, devUrlPromise }
}

(async () => {
  const { server, devUrlPromise } = startDevServer()

  const stopServer = () => {
    try {
      if (server.pid && process.platform === "win32") {
        spawn("taskkill", ["/PID", String(server.pid), "/T", "/F"], {
          stdio: "ignore",
          windowsHide: true,
        })
        return
      }

      server.kill()
    } catch (error) {
      console.warn("Falha ao encerrar servidor", error)
    }
  }

  try {
    const devUrl = await devUrlPromise
    await waitForServer(devUrl, 90000)

    const browser = await chromium.launch({ headless: true })
    try {
      const landingDesktopContext = await browser.newContext({ viewport: { width: 1400, height: 900 } })
      const landingDesktopPage = await landingDesktopContext.newPage()
      await landingDesktopPage.goto(devUrl, { waitUntil: "networkidle" })
      await landingDesktopPage.waitForTimeout(1000)
      await take(landingDesktopPage, "qa-landing-desktop.png")
      await landingDesktopContext.close()

      const landingMobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      })
      const landingMobilePage = await landingMobileContext.newPage()
      await landingMobilePage.goto(devUrl, { waitUntil: "networkidle" })
      await landingMobilePage.waitForTimeout(1000)
      await take(landingMobilePage, "qa-landing-mobile.png")
      await landingMobileContext.close()

      const desktopContext = await createAuthorizedContext(browser, {
        viewport: { width: 1400, height: 900 },
      }, devUrl)
      const page = await desktopContext.newPage()

      await page.goto(`${devUrl}/dashboard/pipeline`, { waitUntil: "networkidle" })
      await page.waitForTimeout(2000)
      await take(page, "qa-dashboard-pipeline-desktop.png")

      await page.fill('input[placeholder="Buscar lead..."]', "zzzzzz")
      await page.waitForTimeout(700)
      await take(page, "qa-pipeline-search-dead.png")

      const pipelineMobileContext = await createAuthorizedContext(browser, {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      }, devUrl)
      const pipelineMobilePage = await pipelineMobileContext.newPage()
      await pipelineMobilePage.goto(`${devUrl}/dashboard/pipeline`, { waitUntil: "networkidle" })
      await pipelineMobilePage.waitForTimeout(2000)
      await take(pipelineMobilePage, "qa-dashboard-mobile.png")
      await pipelineMobileContext.close()

      const inboxContext = await createAuthorizedContext(browser, {
        viewport: { width: 1400, height: 900 },
      }, devUrl)
      const inboxPage = await inboxContext.newPage()
      await inboxPage.goto(`${devUrl}/dashboard/inbox`, { waitUntil: "networkidle" })
      await inboxPage.waitForTimeout(1500)
      await inboxPage.getByRole("button", { name: /nova conversa/i }).first().click()
      await inboxPage.waitForTimeout(500)
      await inboxPage.locator('input[placeholder*="Buscar contato"]').fill("Novo")
      await inboxPage.waitForTimeout(500)
      await take(inboxPage, "qa-inbox-search-and-new-conversation.png")
      await inboxContext.close()

      const chatbotsContext = await createAuthorizedContext(browser, {
        viewport: { width: 1400, height: 900 },
      }, devUrl)
      const chatbotsPage = await chatbotsContext.newPage()
      await chatbotsPage.goto(`${devUrl}/dashboard/chatbots`, { waitUntil: "networkidle" })
      await chatbotsPage.waitForTimeout(1500)
      await take(chatbotsPage, "qa-chatbots-dashboard-desktop.png")

      await openDialogAndCapture(
        chatbotsPage,
        chatbotsPage.getByText("Criar novo fluxo", { exact: true }),
        "Criar novo fluxo",
        "qa-chatbots-flow-dialog-desktop.png",
      )
      await chatbotsPage.getByRole("button", { name: /cancelar/i }).first().click()
      await chatbotsPage.waitForTimeout(300)

      await openDialogAndCapture(
        chatbotsPage,
        chatbotsPage.getByRole("button", { name: /novo agente/i }),
        "Criar novo agente",
        "qa-chatbots-agent-dialog-desktop.png",
      )
      await chatbotsContext.close()

      const contactsContext = await createAuthorizedContext(browser, {
        viewport: { width: 1400, height: 900 },
      }, devUrl)
      const contactsPage = await contactsContext.newPage()
      await contactsPage.goto(`${devUrl}/dashboard/contacts`, { waitUntil: "networkidle" })
      await contactsPage.waitForTimeout(1200)
      await take(contactsPage, "qa-contacts-list-desktop.png")

      await openDialogAndCapture(
        contactsPage,
        contactsPage.getByRole("button", { name: /novo contato/i }),
        "Novo contato",
        "qa-contacts-create-dialog-desktop.png",
      )
      await contactsPage.getByRole("button", { name: /cancelar/i }).click()
      await contactsPage.waitForTimeout(300)

      await contactsPage.locator('input[type="file"]').setInputFiles(contactsFixturePath)
      await contactsPage.getByLabel("Abrir Maria Lima").waitFor({ state: "visible" })
      await contactsPage.waitForTimeout(1000)
      await take(contactsPage, "qa-contacts-imported-jet-sales-desktop.png")

      await contactsPage.goto(`${devUrl}/dashboard/campaigns`, { waitUntil: "networkidle" })
      await contactsPage.getByText("Maria Lima", { exact: true }).first().waitFor({ state: "visible" })
      await contactsPage.waitForTimeout(1000)
      await take(contactsPage, "qa-campaigns-audience-from-jet-sales-desktop.png")

      await contactsContext.close()
      await desktopContext.close()
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    stopServer()
  }
})()
