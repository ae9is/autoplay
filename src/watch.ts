// Login and autoplay match

import { Page } from 'puppeteer-extra-plugin/dist/puppeteer'
import fs from 'fs'
import * as config from './config'
import { delay, longWait } from './time'
import Logger from './logger'
import { BrowserFactory } from './browser'
//import { tryLogin } from './login'

async function watchPage(page: Page) {
  let res = false
  const url = config.watchUrl
  Logger.log('Visiting: ' + url)
  await page.goto(url)
  await longWait(page)

  // Refresh page
  //await page.reload({ waitUntil: ["domcontentloaded"] })

  // Login
  //const loginSuccess = await tryLogin(page)
  //await longWait(page)

  // Try finding video player
  let videoElement
  try {
    videoElement = await page.waitForSelector(config.videoElementSearch)
  } catch (e: any) {
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

;(async () => {
  const browser = await BrowserFactory.new()
  const page = await browser.getNewPage()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Load upcoming match schedule times from file
    const schedFile = config.scheduleFile || 'schedule.json'
    const data = fs.readFileSync(schedFile)
    const schedule = JSON.parse(data.toString())
    Logger.log('Current time: ' + new Date())
    const dates: Date[] = schedule.dates.map((s: string) => new Date(s))
    Logger.log('Loaded upcoming match times: ') // + dates)
    dates.forEach(d => Logger.log(d.toISOString()))

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
    //const hourMs = 60 * 60 * 1000
    //const halfDayMs = 43200 * 1000
    const current = new Date()
    const maxMatchLenMs = 2400 * 3 * 1000 // ~3 hours max possible match length (usu 1.5h)
    let minWaitTimeMs = 7 * 24 * 60 * 60 * 1000 // One week
    dates.forEach(date => {
      // Start half hour before each match scheduled to start (first match has pre-show)
      const startTime = date.getTime() - halfHourMs
      const waitTimeMs = startTime - current.getTime()
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
