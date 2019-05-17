/**
 * 菜单
 */

const request = require("request");

export const requestGetMunu = async ACCESS_TOKEN =>
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
