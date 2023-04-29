// Utility functions
import { Page } from 'puppeteer-core'
import Logger from './logger'

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

async function longWait(page: Page) {
  Logger.log('Waiting 2000ms ...')
  await page.waitForTimeout(2000)
}

async function smallWait(page: Page) {
  Logger.log('Waiting 100ms ...')
  await page.waitForTimeout(100)
}
