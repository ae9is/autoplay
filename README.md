# OWL Autoplay

Puppeteer automation in Chrome to autoplay video.

Customise for your target content by editing the script's CSS selectors and `process.env.URL`.

## Install

1. Install dependencies

```bash
npm i
```

2. _(Optional)_ Setup a new Chrome user data directory and profile

3. Set at least these .env variables:

```bash
USER_DATA_DIR
PROFILE_DIR
ACCOUNT_NAME
PASSWORD
```

4. Enter watch times in `schedule.json`

## Run

```bash
npm run watch
```
