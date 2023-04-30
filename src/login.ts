import { Page } from 'puppeteer-extra-plugin/dist/puppeteer'
import * as config from './config'
import { shortWait } from './time'
import Logger from './logger'

// TODO test, handle 2-factor

// Check if logged in as an account
async function isLoggedIn(page: Page) {
  let avatarButton
  try {
    avatarButton = await page.waitForSelector(config.avatarButtonSearch)
    if (avatarButton) {
      // Avatar is always img, and there is no fallback text
      //const avatarButtonText = await avatarButton.evaluate(e => e.textContent)
      //Logger.log('Logged in as: ' + avatarButtonText)
      return true
    }
  } catch (e: any) {
    Logger.error(e)
  }
  return false
}

// Try to click through the login forms
export async function tryLogin(page: Page) {
  if (await isLoggedIn(page)) {
    return true
  }

  // Try to find login button and click.
  // This will fail if already logged in, but we've already checked if we're already logged in.
  const loginButton = await page.$(config.loginButtonSearch)
  if (loginButton) {
    Logger.log('Found login button! Clicking...')
    await loginButton.click()
    await shortWait(page)
  } else {
    Logger.log('No login button found')
    return false
  }

  let accountNameInput
  let nextButton
  let passwordInput
  try {
    accountNameInput = await page.$(config.accountNameInputSearch)
    nextButton = (await page.$x(config.nextButtonSearch))?.[0]
    if (accountNameInput && nextButton) {
      Logger.log('Attempting to enter account via keyboard input...')
      // It's important to type() slowly or input will run over into next form field!
      await shortWait(page)
      accountNameInput.hover()
      accountNameInput.type(config.accountName)
      await page.waitForTimeout(3000)
      nextButton.hover()
      nextButton.click()
      await shortWait(page)
    } else {
      Logger.log('Could not find full login account form')
    }
  } catch (e: any) {
    Logger.error('Error thrown entering login account: ')
    Logger.error(e)
  }

  try {
    passwordInput = await page.$(config.passwordInputSearch)
    nextButton = (await page.$x(config.nextButtonSearch))?.[0]
    if (passwordInput && nextButton) {
      Logger.log('Attempting to enter password via keyboard input...')
      // It's important to type() slowly or input will run over into next form field!
      await shortWait(page)
      passwordInput.hover()
      passwordInput.type(config.accountName)
      await page.waitForTimeout(3000)
      nextButton.hover()
      nextButton.click()
      await shortWait(page)
    } else {
      Logger.log('Could not find full login password form')
    }
  } catch (e: any) {
    Logger.error('Error thrown entering login password: ')
    Logger.error(e)
  }

  if (await isLoggedIn(page)) {
    return true
  }

  // Note: At this point we should have autologged in with the login button click,
  //  which closes the menu automatically

  return false
}
