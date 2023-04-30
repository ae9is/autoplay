// Login and autoplay OWL match

require('dotenv').config()
const puppeteer = require('puppeteer-core')
const fs = require('fs')

const url = process.env.URL || 'https://overwatchleague.com/en-us/'
const outImg = process.env.OUT_IMG || 'snapshot.png'
const userDataDir = process.env.USER_DATA_DIR || './path/to/user/data/dir'
// profile dir within userDataDir for ex: ./path/to/user/data/dir/MyProfile
const profileDir = process.env.PROFILE_DIR || 'MyProfile'
const execPath = process.env.EXEC_PATH || 'google-chrome'
const accountName = process.env.ACCOUNT_NAME
const password = process.env.PASSWORD

const profileLoginButtonSearch = 'div[id="login-dropdown-button-testId"]'
const loginButtonSearch = 'a[id="login-button-testId"]'
const loginNameBannerSearch = 'div#login-dropdown-button-testId div#login.cHVkMG'
const accountNameInputSearch = 'input#accountName'
const passwordInputSearch = 'input#password'
const loginPageLoginButtonSearch = 'button#submit'
const videoElementSearch = 'iframe.ryXSX'

class Logger {
  static log(text) {
    console.log(text)
  }

  static error(text) {
    console.error(text)
  }
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

async function longWait(page) {
  Logger.log('Waiting 2000ms ...')
  await page.waitForTimeout(2000)
}

async function smallWait(page) {
  Logger.log('Waiting 100ms ...')
  await page.waitForTimeout(100)
}

// Check if logged in as an account
async function isLoggedIn(page) {
  let loginNameBanner = ''
  try {
    loginNameBanner = await page.waitForSelector(loginNameBannerSearch)
  } catch (e) {
    Logger.error(e)
  } finally {
    if (loginNameBanner) {
      const loginNameBannerText = await loginNameBanner.evaluate((e) => e.textContent)
      if (loginNameBannerText.replace(/\s/g, '').toLowerCase() != 'login') {
        Logger.log('Logged in as: ' + loginNameBannerText)
        return true
      } else {
        Logger.log('Not logged in, banner is: ' + loginNameBannerText)
      }
    } else {
      Logger.log('No login account name banner found')
    }
  }
  return false
}

// Try to click through the login forms
async function tryLogin(page) {
  if (await isLoggedIn(page)) {
    return true
  }

  // Try to find profile button and click
  const profileLoginButton = (await page.$(profileLoginButtonSearch)) || ''
  if (profileLoginButton) {
    Logger.log('Found profile login button! Clicking...')
    await profileLoginButton.click()
    await smallWait(page)
  } else {
    Logger.log('No profile login button found')
    return false
  }

  // Now that profile button clicked, try to find login button and click.
  // This will fail if already logged in, but we've already checked if we're already logged in.
  const loginButton = (await page.$(loginButtonSearch)) || ''
  if (loginButton) {
    Logger.log('Found login button! Clicking...')
    await loginButton.click()
    await smallWait(page)
  } else {
    Logger.log('No login button found')
    return false
  }

  let accountNameInput = ''
  let passwordInput = ''
  let loginPageLoginButton = ''
  try {
    accountNameInput = (await page.$(accountNameInputSearch)) || ''
    passwordInput = (await page.$(passwordInputSearch)) || ''
    loginPageLoginButton = (await page.$(loginPageLoginButtonSearch)) || ''
  } catch (e) {
    Logger.error('Error thrown grabbing login inputs: ')
    Logger.error(e)
  }

  if (accountNameInput && passwordInput && loginPageLoginButton) {
    Logger.log('Attempting to log in via keyboard input...')
    // It's important to type() slowly or input will run over into next form field!
    await smallWait(page)
    accountNameInput.hover()
    accountNameInput.type(accountName)
    await page.waitForTimeout(3000)
    passwordInput.hover()
    passwordInput.type(password)
    await page.waitForTimeout(4000)
    loginPageLoginButton.hover()
    loginPageLoginButton.click()
    await smallWait(page)
  } else {
    Logger.log('Could not find full login submit form')
  }

  if (await loggedIn(page)) {
    return true
  }

  // Note: At this point we should have autologged in with the login button click,
  //  which closes the menu automatically

  return false
}

async function watchPage(page) {
  let res = false
  await page.goto(url)
  await longWait(page)

  // Refresh page
  //await page.reload({ waitUntil: ["domcontentloaded"] })

  // Login
  const loginSuccess = await tryLogin(page)
  await longWait(page)

  // Try finding video player
  let videoElement = ''
  try {
    videoElement = await page.waitForSelector(videoElementSearch)
  } catch (e) {
    Logger.error(e)
  } finally {
    if (videoElement) {
      Logger.log('Found video element! Clicking...')
      await videoElement.click()
      res = true
    } else {
      Logger.log('No video element found')
    }
  }

  Logger.log('Done')
  return res
}

async function takeScreenshotAndCloseBrowser() {
  Logger.log('Taking page screenshot...')
  await page.screenshot({ path: outImg })
  await smallWait(page)
  Logger.log('Closing session')
  await browser.close()
}

;(async () => {
  // Launch browser
  const extraArgs = [
    '--user-data-dir=' + userDataDir,
    '--profile-directory=' + profileDir, // Can be omitted if Default
    '--enable-sync',
    '--start-maximized', // Needed so that with viewport res forces desktop not mobile layout
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
  Logger.log('Launching browser with profile at: ' + profileDir)
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: execPath,
    //defaultViewport: null,  // default is 800x600
    //ignoreDefaultArgs: true,
    //ignoreDefaultArgs: ignoredArgs,
    args: extraArgs,
  })

  const page = await browser.newPage()

  // Need to make sure puppeteer launched browser is in desktop mode not mobile!
  // I.e. make sure the window is wide enough for desktop layout.
  // This is because mobile doesn't have certain test selectors we need.
  //
  // For ex. this is the #login-dropdown-button-testId
  //  selector in mobile:
  //  #__next > div > div > div.renderblocksstyles__DesktopBlock-sc-3odw2o-0.kwxcSL > div > div > div:nth-child(3) > div
  //
  await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 })

  while (true) {
    // Load upcoming match schedule times from file
    const schedFile = 'schedule.json'
    const data = fs.readFileSync(schedFile)
    const schedule = JSON.parse(data)
    Logger.log('Current time: ' + new Date())
    const dates = schedule.dates.map((s) => new Date(s))
    Logger.log('Loaded upcoming match times: ' + dates)

    // Compare dates with current time to find next...
    //
    // for each scheduled time
    //   if current time less than half hour to scheduled time or less than match length after
    //     then good enough start it up
    //   also if wait time less than current min and in the future
    //     save the time to start
    // if no start now flag
    //   wait time
    //
    const halfHourMs = 30 * 60 * 1000
    const hourMs = 60 * 60 * 1000
    const halfDayMs = 43200 * 1000
    const current = new Date()
    const maxMatchLenMs = 2400 * 3 * 1000 // ~3 hours max possible match length (usu 1.5h)
    let minWaitTimeMs = 7 * 24 * 60 * 60 * 1000 // One week
    dates.forEach(function (date) {
      // Start half hour before each match scheduled to start (first match has pre-show)
      const startTime = date - halfHourMs
      const waitTimeMs = startTime - current
      // Match already started
      if (waitTimeMs < 0) {
        // And likely still in progress
        if (Math.abs(waitTimeMs) < maxMatchLenMs) {
          // So start without delay
          minWaitTimeMs = 0
        }
        // If it's more than match length after ignore the entry
      } else {
        // Upcoming match, store the wait time if smaller than current min
        if (waitTimeMs < minWaitTimeMs) {
          minWaitTimeMs = waitTimeMs
        }
      }
    })

    const minWaitTimeMin = minWaitTimeMs / 1000 / 60
    const minWaitTimeHr = minWaitTimeMin / 60
    Logger.log('Time to wait (min): ' + minWaitTimeMin + ' / (hr): ' + minWaitTimeHr)
    await delay(minWaitTimeMs)
    Logger.log('Waiting finished')

    // Attempt to load page and watch video.
    // If watch video fails, then queue up another try in 15 minutes.
    Logger.log('Attempting to watch page @ ' + new Date() + '...')
    const retryTimeMs = halfHourMs / 2
    let res = false
    while (!res) {
      res = await watchPage(page)
      if (res) {
        Logger.log('Should be successfully watching now...')
        break
      }
      Logger.log('Delaying and trying again in ' + retryTimeMs / 1000)
      await delay(retryTimeMs)
    }

    Logger.log('Will keep watching for ' + maxMatchLenMs / 1000 / 60 + ' min')
    await delay(maxMatchLenMs)
    Logger.log('Finished watching @ ' + new Date())
  }
})()
