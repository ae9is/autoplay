//import puppeteer, { Page, Browser as PuppeteerBrowser } from 'puppeteer-core'
import puppeteer from 'puppeteer-extra'
import { Browser, Page } from 'puppeteer-extra-plugin/dist/puppeteer'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
puppeteer.use(StealthPlugin())
import * as config from './config'
import Logger from './logger'
import { shortWait } from './time'

// Private constructor. Get instances using Browser.new() not Browser().
export class BrowserFactory {
  #browser

  // @private
  private constructor(browser: Browser) {
    this.#browser = browser
  }

  static async new() {
    // Launch browser
    const extraArgs = [
      '--user-data-dir=' + config.userDataDir,
      '--profile-directory=' + config.profileDir, // Can be omitted if Default
      '--enable-sync',
      '--start-maximized', // Needed so that with viewport res forces desktop not mobile layout
      '--no-sandbox', // Google account logins blocked from automation runs
    ]
    /*
    const ignoredArgs = [
        '--password-store=basic',
        '--enable-automation',
        '--disable-sync',
        '--disable-background-networking',
    ]
    */
    // Launch with specific browser, and modify puppeteer's default startup flags.
    // You can check chrome://version to see what the default flags are for puppeteer.
    Logger.log('Launching browser with profile at: ' + config.profileDir)
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: config.execPath,
      //ignoreDefaultArgs: true,
      //ignoreDefaultArgs: ignoredArgs,
      args: extraArgs,
    })

    return new BrowserFactory(browser)
  }

  close = () => {
    this.#browser?.close()
  }

  getNewPage = async () => {
    if (!this.#browser) {
      throw new Error('Must initialize browser first using Browser.getBrowser()')
    }
    const page = await this.#browser.newPage()

    // Need to make sure puppeteer launched browser is in desktop mode not mobile!
    // I.e. make sure the window is wide enough for desktop layout.
    // This is because mobile doesn't have certain test selectors we need.
    //
    // For ex. this is the #login-dropdown-button-testId
    //  selector in mobile:
    //  #__next > div > div > div.renderblocksstyles__DesktopBlock-sc-3odw2o-0.kwxcSL > div > div > div:nth-child(3) > div
    //
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 })

    return page
  }

  takeScreenshotAndCloseBrowser = async (page: Page) => {
    Logger.log('Taking page screenshot...')
    await page.screenshot({ path: config.outImg })
    await shortWait(page)
    Logger.log('Closing session')
    this.close()
  }
}
