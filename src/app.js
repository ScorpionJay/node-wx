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
app.use(bodyParser({ enableTypes: ["json", "form", "text"] }));
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "PUT,DELETE,POST,GET");
  ctx.set("Access-Control-Max-Age", 3600 * 24);
  ctx.set("Access-Control-Allow-Credentials", true);
  await next();
});

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

app.use(
  route.get("/test", async ctx => {
    console.log("------test----");
    ctx.body = { name: "jay" };
  })
);

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

// auth
app.use(
  route.get("/auth", async ctx => {
    const code = ctx.request.query.code;
    console.log("------auth----" + code);
    //第二步：通过code换取网页授权access_token
    const data = await requestOauth2Access_token(code);
    // console.log('data',JSON.stringify(data))
    const { access_token, openid } = JSON.parse(data);
    console.log("xxxxxx", access_token, openid);
    //第四步：拉取用户信息(需scope为 snsapi_userinfo)
    const userInfo = await requestAuthUserinfo(access_token, openid);
    console.log("aaaaaaa", JSON.stringify(userInfo));
    ctx.body = userInfo;
  })
);

// auth
app.use(
  route.get("/authBase", async ctx => {
    const code = ctx.request.query.code;
    console.log("------auth----" + code);
    //第二步：通过code换取网页授权access_token
    const data = await requestOauth2Access_token(code);
    // console.log('data',JSON.stringify(data))
    const { openid } = JSON.parse(data);
    ctx.body = { openid };
  })
);

/**
 * 根据token获取ticket
 * @param {token} token
 */
const requestOauth2Access_token = async code =>
  new Promise(function(resolve, reject) {
    let url =
      "https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code";
    url = url
      .replace("APPID", config.appId)
      .replace("SECRET", config.appSecret)
      .replace("CODE", code);

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
 * 根据token获取ticket
 * @param {token} token
 */
const requestAuthUserinfo = async (ACCESS_TOKEN, OPENID) =>
  new Promise(function(resolve, reject) {
    let url =
      "https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN";
    url = url.replace("ACCESS_TOKEN", ACCESS_TOKEN).replace("OPENID", OPENID);

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
 * get menu
 */
app.use(
  route.get("/getMenu", async ctx => {
    const code = ctx.request.query.code;
    console.log("------getMenu----" + code);
    let token = await getToken();
    const menu = await requestGetMunu(token);
    console.log("aaaaaaa", JSON.stringify(menu));
    ctx.body = menu;
  })
);

const requestGetMunu = async ACCESS_TOKEN =>
  new Promise(function(resolve, reject) {
    let url =
      "https://api.weixin.qq.com/cgi-bin/menu/get?access_token=ACCESS_TOKEN";
    url = url.replace("ACCESS_TOKEN", ACCESS_TOKEN);

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
 * create menu
 */
app.use(
  route.post("/setMenu", async ctx => {
    let m = "";
    try {
      m = JSON.parse(ctx.request.body);
      console.log("------setMenu----" + m);
    } catch (error) {
      console.log("------error----" + error);
    }

    let token = await getToken();
    m = m || {
      button: [
        { type: "click", name: "Button", key: "11", sub_button: [] },
        {
          type: "view",
          name: "iMusic",
          url:
            "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8dfda79a073efa18&redirect_uri=http://jay.aliyuntao.top/wx_oauth.html&response_type=code&scope=snsapi_userinfo&state=imusic",
          sub_button: []
        },
        {
          name: "菜单",
          sub_button: [
            {
              type: "scancode_push",
              name: "扫二维码",
              key: "31",
              sub_button: []
            },
            {
              type: "location_select",
              name: "获取地址",
              key: "32",
              sub_button: []
            },
            {
              type: "view",
              name: "公交卡余额查询",
              url:
                "http://shanghaicity.openservice.kankanews.com/public/traffic/jtkye",
              sub_button: []
            },
            {
              type: "view",
              name: "活动",
              url: "http://jay.aliyuntao.top/swiper/",
              sub_button: []
            }
          ]
        }
      ]
    };
    const menu = await requestSetMenu(token, m);
    console.log("aaaaaaa", JSON.stringify(menu));
    ctx.body = menu;
  })
);

const requestSetMenu = async (ACCESS_TOKEN, m) =>
  new Promise(function(resolve, reject) {
    let url =
      "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN";
    url = url.replace("ACCESS_TOKEN", ACCESS_TOKEN);

    request(
      {
        url: url,
        method: "post",
        body: JSON.stringify(m)
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

export default app;
