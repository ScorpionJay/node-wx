/**
 * 获取token
 *  https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 * 返回数据
 * {
  "access_token": "5_4wIKaPGtpILZnoAMVD8ELPdlouvgB4_G0UYDvgvR1lvw_qxRO1_cWf2Y637yPfQHOqi2S8wy5HzHd65iVR9XGQcWdHGp6uNh51qsS3BIP7GS12OaW2R_lRk0XJxfgyfJfLkNEAEDHKU1LboBCWSdABAOIE",
  "expires_in": 7200
  }
 */
const request = require("request");
import config from "../config.js";
import Cache from "../utils/cache";
const cache = new Cache();

/**
 * 获取token
 * @param {*} appId
 * @param {*} appSecret
 */
export const getToken = async () =>
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
export const requestToken = async () =>
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
