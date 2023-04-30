// Utility functions
import { Page } from 'puppeteer-extra-plugin/dist/puppeteer'
import Logger from './logger'
import dayjs from 'dayjs'

export function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

export async function longWait(page: Page) {
  Logger.log('Waiting 2000ms ...')
  await page.waitForTimeout(2000)
}

export async function shortWait(page: Page) {
  Logger.log('Waiting 100ms ...')
  await page.waitForTimeout(100)
}

export function parseISO8601String(datetime: string) {
  const parsed = dayjs(datetime)
  return parsed
}

// Returns current date in ISO8601, without fraction seconds e.g. '2020-04-02T08:02:17-05:00'
// ref: https://day.js.org/docs/en/display/format
export function toISO8601String(datetime: string, format = 'ddd, MMM D YYYY h:mm A') {
  const parsed = dayjs(datetime, format)
  const formatted = parsed.format()
  return formatted
}

// Formats date string in arbitrary time zone like Date.toISOString().
// Note: Doesn't work in Node.js. OK in browser.
// ref: https://stackoverflow.com/questions/49330139
export function toLocalISOString(datetime: string) {
  Logger.log(datetime)
  const date = new Date(datetime)
  Logger.log(date.toString())
  Logger.log('' + date.getTime())
  Logger.log('' + date.getTimezoneOffset()*60000)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset()*60000)
  Logger.log('localDate: ' + localDate)
  return localDate.toISOString().slice(0, -1)
}