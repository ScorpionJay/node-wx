/**
 * oAuth
 */

const request = require("request");
import config from "../config.js";

/**
 * 根据code换取网页授权access_token
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
 * 根据openId获取微信信息
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

export default { requestOauth2Access_token, requestAuthUserinfo };
