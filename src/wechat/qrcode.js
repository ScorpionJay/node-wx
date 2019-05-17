/**
 * /
// http请求方式: POST
// URL: https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN
// POST数据格式：json
// POST数据例子：{"expire_seconds": 604800, "action_name": "QR_SCENE", "action_info": {"scene": {"scene_id": 123}}}

// 或者也可以使用以下POST数据创建字符串形式的二维码参数：
// {"expire_seconds": 604800, "action_name": "QR_STR_SCENE", "action_info": {"scene": {"scene_str": "test"}}}
https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET
 */

const request = require("request");

/**
 * 根据token获取ticket
 * @param {token} token
 */
export const create = async (TOKEN, data) =>
  new Promise(function(resolve, reject) {
    let url =
      "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN";
    url = url.replace("TOKEN", TOKEN);

    request(
      {
        url: url,
        method: "post",
        body: JSON.stringify(data)
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
