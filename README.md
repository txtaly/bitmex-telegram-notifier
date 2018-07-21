# What is this?
This is a simple script that send BitMEX exchange order's changes to telegram channel

## How to use:
1) Add your bot to telegram channel as Administrator

2) Create `.env` file with your values:

   ```
   TELEGRAM_BOT_TOKEN=xxxx
   TELEGRAM_CHANNEL_NAME=@xxxx
   BITMEX_API_KEY=xxxxx
   BITMEX_API_SECRET=xxxxx
   ```

3) Run `npm install`
4) Run `node index.js`