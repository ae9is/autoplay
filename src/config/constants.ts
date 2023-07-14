import * as dotenv from 'dotenv'
dotenv.config()

export const scheduleUrl = process.env.SCHED_URL || 'https://overwatchleague.com/en-us/schedule'
export const watchUrl = process.env.WATCH_URL || 'https://www.youtube.com/@overwatchleague'
export const outImg = process.env.OUT_IMG || 'snapshot.png'
export const userDataDir = process.env.USER_DATA_DIR || './profile'
// profile dir within userDataDir for ex: ./profile/MyProfile
export const profileDir = process.env.PROFILE_DIR || 'MyProfile'
export const execPath = process.env.EXEC_PATH || 'google-chrome'
export const accountName = process.env.ACCOUNT_NAME || ''
export const password = process.env.PASSWORD || ''
export const scheduleFile = process.env.SCHED_FILE || 'schedule.json'

// Watch page selectors
export const avatarButtonSearch = 'button#avatar-btn'
export const loginButtonSearch = 'a[aria-label="Sign in"]'
export const accountNameInputSearch = 'input[type="email"]'
export const nextButtonSearch = '//span[contains(., "Next")]'
export const passwordInputSearch = 'input[type="password"]'
export const videoElementSearch = 'span[aria-label="LIVE"]'

// Schedule page selectors
export const scheduledDateTimeSearch = 'div[data-testid="collapsableSection"]' // collapsable sic
export const scheduledDateSearch = 'div[class$="lfewHh"]'
export const scheduledTimeSearch = 'div[data-testid="matchStatus"] > div:nth-child(2)'
export const upcomingMatchesButtonSearch = '//button[contains(., "Upcoming Matches")]'

