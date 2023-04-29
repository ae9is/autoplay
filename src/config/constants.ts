import * as dotenv from 'dotenv'
dotenv.config()

export const url = process.env.URL || 'https://overwatchleague.com/en-us/'
export const outImg = process.env.OUT_IMG || 'snapshot.png'
export const userDataDir = process.env.USER_DATA_DIR || './profile'
// profile dir within userDataDir for ex: ./profile/MyProfile
export const profileDir = process.env.PROFILE_DIR || 'MyProfile'
export const execPath = process.env.EXEC_PATH || 'google-chrome'
export const accountName = process.env.ACCOUNT_NAME
export const password = process.env.PASSWORD

export const profileLoginButtonSearch = 'div[id="login-dropdown-button-testId"]'
export const loginButtonSearch = 'a[id="login-button-testId"]'
export const loginNameBannerSearch = 'div#login-dropdown-button-testId div#login.cHVkMG'
export const accountNameInputSearch = 'input#accountName'
export const passwordInputSearch = 'input#password'
export const loginPageLoginButtonSearch = 'button#submit'
export const videoElementSearch = 'iframe.ryXSX'
