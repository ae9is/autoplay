// Grab weekly schedule
import fs from 'fs'
import { BrowserFactory } from './browser'
import * as config from './config'
import { toISO8601String } from './time'
import Logger from './logger'
import { filterDups, filterNull } from './util'

interface DateTime {
  date: string,
  time: string,
}

// Example simplified page format expected
/* 
const testHtml = `<!DOCTYPE html><html><body>
  <div>
    <div class="something fJkjEU">
      <p class="something-else">FRI, MAY 05</p>
      <p class="something-else">12:00 PM</p>
    </div>
    <div class="something fJkjEU">
      <p class="something-else">SAT, MAY 06</p>
      <p class="something-else">2:00 AM</p>
    </div>
  </div>
</body></html>`;
*/

(async () => {
  // To grab schedule for a particular week:
  //const week = '2'
  //const urlForWeek = config.scheduleUrl + '?stage=regular_season&week=' + week + '&team=allteams'

  const url = config.scheduleUrl
  const browser = await BrowserFactory.new()
  const page = await browser.getNewPage()
  Logger.log('Visiting: ' + url)
  await page.goto(url)
  //page.setContent(testHtml)
  Logger.log('Taking page screen shot...')
  await page.screenshot({ path: config.outImg, fullPage: true })

  Logger.log('Crawling page for times ...')
  const dateTimeCards = await page.$$(config.scheduledDateTimeSearch)
  const promises = dateTimeCards.flatMap(async card => {
    const children = await card.$$('p')
    if (children?.length >= 2) {
      const [dateChild, timeChild] = children.slice(0, 2)
      return {
        // Convert mixed case to upper for easy duplicates filtering
        date: (await (await dateChild.getProperty('innerText')).jsonValue())?.toUpperCase(),
        time: (await (await timeChild.getProperty('innerText')).jsonValue())?.toUpperCase(),
      }
    }
    return null
  })
  const datesNullable: (DateTime | null)[] = await Promise.all(promises)
  // Discard nulls and duplicates from the Handle's retrieved by puppeteer parse
  const dateTimes: DateTime[] = filterDups(filterNull(datesNullable))

  // Example dateTimes format
  /*
  const dateTimes = [
    { date: 'Sat, Apr 29', time: '12:00 PM' },
    { date: 'Sat, Apr 29', time: '1:30 PM' },
    { date: 'Sat, Apr 29', time: '3:00 PM' },
  ]
  */

  if (dateTimes?.length > 0) {
    // Export to file
    Logger.log('Exporting ' + dateTimes.length + ' times to file: ' + config.scheduleFile)
    const stream = fs.createWriteStream(config.scheduleFile, { flags: 'w' })
    stream.once('open', function() {
      stream.cork()
      stream.write('{\n\t"dates": [\n')
      dateTimes.forEach((dateTime, idx, dateTimes) => {
        if (!dateTime.date || !dateTime.time) {
          Logger.error('bad date: ' + (dateTime.date ?? '') + ' ' + (dateTime.time ?? ''))
        }
        else if (dateTime.time.trim().toLowerCase() !== 'final') {
          // Exclude finished
          const isLastItem = Object.is(dateTimes.length - 1, idx)
          const year = (new Date()).getFullYear()
          const dateString = dateTime.date + ' ' + year + ' '+ dateTime.time
          Logger.log('Converting: ' + dateString)
          const dateStringIso = toISO8601String(dateTime.date + ' ' + year + ' '+ dateTime.time)
          const eol = isLastItem ? '"\n' : '",\n'
          const line = '\t\t"' + dateStringIso + eol
          Logger.log('Writing: ' + line)
          stream.write(line)
        }
      })
      stream.write('\t]\n}\n')
      stream.uncork()
      stream.end()
      stream.close()
    })
  }

  browser.close()
})()
