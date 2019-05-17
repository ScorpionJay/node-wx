/**
 * 根据token获取ticket
 * @param {token} token
 *  * https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi
 * {
    "errcode": 0,
    "errmsg": "ok",
    "ticket": "sM4AOVdWfPE4DxkXGEs8VH9mwGhS5XRg_Hrl6rZMTIcE2AhCmijHKP0bvJ25C5yFCP-LoMgfafoNqsm2UMprZQ",
    "expires_in": 7200
    }
 */

const request = require("request");
import Cache from "../utils/cache";
import { getToken } from "./token";
const cache = new Cache();

export const getTicket = async () =>
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
export const requestTicket = async token =>
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
