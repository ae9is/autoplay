# OWL Autoplay

Puppeteer automation in Chrome to autoplay video.

Customise for your target content by editing the CSS selectors and other constants in `src/constants.ts`

## Setup

1. Install dependencies

    ```bash
    npm i
    ```

2.  _(Optional)_ Setup a specific Chrome user data directory and profile

    Set .env variables:

    ```bash
    USER_DATA_DIR
    PROFILE_DIR
    ```

3. Login to video site with Chrome user:

    1. Enter a dummy watch time (for ex. current date time) in `schedule.json`
    2. Run the watcher script via `npm run watch`
    3. Open a new tab and login to watch page

## Run

1. Update watch times in `schedule.json`

2. Run watcher

    ```bash
    npm run watch
    ```
