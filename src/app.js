/**
 * kao app
 */

const Koa = require("koa");
const http = require("http");
const route = require("koa-route");
const bodyParser = require("koa-bodyparser");
const CryptoJS = require("crypto-js");
const request = require("request");
const views = require("koa-views");
const koaStatic = require("koa-static");
const path = require("path");

const app = new Koa();
app.use(bodyParser());

import config from "./config.js";
import Cache from "./utils/cache";
const cache = new Cache();
// console.log(cache)
// cache.set('appId',"asdfa");
// console.log(cache)
// let appId = cache.get('appId')
// console.log(appId)
// console.log(cache)

// 静态文件配置
app.use(views(path.resolve(__dirname, "./static/"), { map: { html: "html" } }));
app.use(koaStatic(path.resolve(__dirname, "./static/")));

/**
 * 微信连接检查
 */
app.use(
  route.get("/wx", async ctx => {
    console.log("~~~wx~~~");
    let signature = ctx.request.query.signature;
    let echostr = ctx.request.query.echostr;
    let timestamp = ctx.request.query.timestamp;
    let nonce = ctx.request.query.nonce;
    console.log(signature, echostr, timestamp, nonce);
    let token = "mynameisjay";
    // 1）将token、timestamp、nonce三个参数进行字典序排序
    let list = [token, timestamp, nonce].sort();
    // 2）将三个参数字符串拼接成一个字符串进行sha1加密
    let str = list.join("");
    let result = CryptoJS.SHA1(str).toString();
    // let data = await banner();
    if (result === signature) {
      ctx.body = echostr; // 返回微信传来的echostr，表示校验成功，此处不能返回其它
    } else {
      ctx.body = false;
    }
  })
);

/**
 * 获取token
 * https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 * 返回数据
 * {
  "access_token": "5_4wIKaPGtpILZnoAMVD8ELPdlouvgB4_G0UYDvgvR1lvw_qxRO1_cWf2Y637yPfQHOqi2S8wy5HzHd65iVR9XGQcWdHGp6uNh51qsS3BIP7GS12OaW2R_lRk0XJxfgyfJfLkNEAEDHKU1LboBCWSdABAOIE",
  "expires_in": 7200
  }
 */
app.use(
  route.get("/token", async ctx => {
    console.log("~~~get token~~~");
    let data = await getToken();
    ctx.body = data;
  })
);

/**
 * 获取token
 * @param {*} appId
 * @param {*} appSecret
 */
const getToken = async () =>
  new Promise(async function(resolve, reject) {
    let token = cache.get("token");
    // token 不存在
    if (token) {
      console.log("缓存中拿取token");
      resolve(token);
    } else {
      let tokenData = await requestToken();
      token = JSON.parse(tokenData).access_token;
      cache.set("token", token, 60 * 60 * 1.5 * 1000); //1.5小时
      resolve(token);
    }
  });

/**
 * 请求token
 * @param {*} appId
 * @param {*} appSecret
 */
const requestToken = async () =>
  new Promise(function(resolve, reject) {
    let url =
      "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET";
    url = url
      .replace("APPID", config.appId)
      .replace("APPSECRET", config.appSecret);
    request(
      {
        url: url,
        method: "get"
      },
      (error, response, body) => {
        console.log(body);
        if (!error && response.statusCode == 200) {
          try {
            resolve(body);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(error);
        }
      }
    );
  });

/**
 * 获取ticket
 * https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi
 * {
    "errcode": 0,
    "errmsg": "ok",
    "ticket": "sM4AOVdWfPE4DxkXGEs8VH9mwGhS5XRg_Hrl6rZMTIcE2AhCmijHKP0bvJ25C5yFCP-LoMgfafoNqsm2UMprZQ",
    "expires_in": 7200
    }
 */
app.use(
  route.get("/ticket", async ctx => {
    console.log("~~~get ticket~~~");
    let data = await getTicket();
    console.log("test", data);
    ctx.body = data;
  })
);

/**
 * 根据token获取ticket
 * @param {token} token
 */
const getTicket = async () =>
  new Promise(async function(resolve, reject) {
    let ticket = cache.get("ticket");
    if (ticket) {
      resolve(ticket);
    } else {
      let token = await getToken();

      let data = await requestTicket(token);
      console.log(data);
      // {"errcode":42001,"errmsg":"access_token expired hint: [ERAYaa0846vr30!]"}
      let jsonData = JSON.parse(data);
      if (jsonData.errcode === 0) {
        cache.set("ticket", jsonData.ticket, 60 * 60 * 1.5 * 1000);
        resolve(jsonData.ticket);
      } else {
        token = await getToken();
        ticket = await requestTicket(token);
        resolve(ticket);
      }
    }
  });

/**
 * 根据token获取ticket
 * @param {token} token
 */
const requestTicket = async token =>
  new Promise(function(resolve, reject) {
    let url =
      "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi";
    url = url.replace("ACCESS_TOKEN", token);

    request(
      {
        url: url,
        method: "get"
      },
      (error, response, body) => {
        console.log(body);
        if (!error && response.statusCode == 200) {
          try {
            resolve(body);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(error);
        }
      }
    );
  });

/**
 * 获取微信分享签名
 */
app.use(
  route.get("/wxShare", async ctx => {
    console.log("~~~wx share~~~");

    let jsapi_ticket = await getTicket();
    let nonce_str = Math.random()
      .toString(36)
      .substr(2, 15);
    let timestamp = parseInt(new Date().getTime() / 1000) + "";
    let url = ctx.request.query.url;

    let str =
      "jsapi_ticket=" +
      jsapi_ticket +
      "&noncestr=" +
      nonce_str +
      "&timestamp=" +
      timestamp +
      "&url=" +
      url;
    let signature = CryptoJS.SHA1(str).toString();

    let data = {
      appId: config.appId,
      timestamp: timestamp,
      nonceStr: nonce_str,
      signature: signature
    };
    ctx.body = data;
  })
);

export default app;
