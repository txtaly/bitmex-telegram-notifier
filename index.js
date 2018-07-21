const crypto = require('crypto');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const _ = require('lodash');
const Promise = require('bluebird');

require('dotenv').config();

const BITMEX_URL = 'https://www.bitmex.com';

let currentOrderList = []

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

function getHeaders(method, path, data) {

  const expires = new Date().getTime() + (60 * 1000);

  const signature = crypto.createHmac('sha256', process.env.BITMEX_API_SECRET)
    .update(method + path + expires + data).digest('hex');

  return {
    'api-expires': expires,
    'api-key': process.env.BITMEX_API_KEY,
    'api-signature': signature,
    'content-type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
}

function getOrderList() {
  return axios.get(`${BITMEX_URL}/api/v1/order?reverse=true`, {
    headers: {
      ...getHeaders('GET', '/api/v1/order?reverse=true', '')
    }
  })
    .then((res) => {
      return res.data
    })
    .catch(err => {

      if (err.response.data) {
        throw err.response.data
      }

      throw err
    })
}

async function main() {
  const newOrderList = await getOrderList()

  if (currentOrderList.length > 0) {
    const diff = _.differenceWith(newOrderList, currentOrderList, _.isEqual)

    if (diff.length > 0) {
      let text = '';
      await Promise.map(diff, (order) => {
        text += `SYMBOL: ${order.symbol}\nSIDE: ${order.side}\nQTY: ${order.orderQty}\nPRICE: ${order.price}\nTYPE: ${order.ordType}\nSTATUS: ${order.ordStatus}`
      });
      await bot.sendMessage(process.env.TELEGRAM_CHANNEL_NAME, text)
    }

  }

  currentOrderList = newOrderList

  await Promise.delay(5000)

  await main()
}

main()
  .catch(err => {
    console.log(err)
    process.exit(1)
  })