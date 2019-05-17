/**
 * 消息处理
 */

const ejs = require("ejs");

const xml2js = require("xml2js");

let tpl = `
<xml>
 <ToUserName><![CDATA[<%-toUsername%>]]></ToUserName>
 <FromUserName><![CDATA[<%-fromUsername%>]]></FromUserName>
 <CreateTime><%=createTime%></CreateTime>
 <MsgType><![CDATA[<%=msgType%>]]></MsgType>
 <% if (msgType === 'news') { %>
 <ArticleCount><%=content.length%></ArticleCount>
 <Articles>
 <% content.forEach(function(item){ %>
 <item>
 <Title><![CDATA[<%-item.title%>]]></Title>
 <Description><![CDATA[<%-item.description%>]]></Description>
 <PicUrl><![CDATA[<%-item.picUrl || item.picurl || item.pic || item.thumb_url %>]]></PicUrl>
 <Url><![CDATA[<%-item.url%>]]></Url>
 </item>
 <% }); %>
 </Articles>
 <% } else if (msgType === 'music') { %>
 <Music>
 <Title><![CDATA[<%-content.title%>]]></Title>
 <Description><![CDATA[<%-content.description%>]]></Description>
 <MusicUrl><![CDATA[<%-content.musicUrl || content.url %>]]></MusicUrl>
 <HQMusicUrl><![CDATA[<%-content.hqMusicUrl || content.hqUrl %>]]></HQMusicUrl>
 </Music>
 <% } else if (msgType === 'voice') { %>
 <Voice>
 <MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>
 </Voice>
 <% } else if (msgType === 'image') { %>
 <Image>
 <MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>
 </Image>
 <% } else if (msgType === 'video') { %>
 <Video>
 <MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>
 <Title><![CDATA[<%-content.title%>]]></Title>
 <Description><![CDATA[<%-content.description%>]]></Description>
 </Video>
 <% } else { %>
 <Content><![CDATA[<%-content%>]]></Content>
 <% } %>
</xml>
`;
const compiled = ejs.compile(tpl);

/**
 * 解析
 * @param {*} xml
 */
function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(
      xml,
      { trim: true, explicitArray: false, ignoreAttrs: true },
      function(err, result) {
        if (err) {
          return reject(err);
        }
        resolve(result.xml);
      }
    );
  });
}

/**
 * 回复
 * @param {*} content
 * @param {*} fromUsername
 * @param {*} toUsername
 */
function reply(content, fromUsername, toUsername) {
  var info = {};
  var type = "text";
  info.content = content || "";
  // 判断消息类型
  if (Array.isArray(content)) {
    type = "news";
  } else if (typeof content === "object") {
    if (content.hasOwnProperty("type")) {
      type = content.type;
      info.content = content.content;
    } else {
      type = "music";
    }
  }
  info.msgType = type;
  info.createTime = new Date().getTime();
  info.toUsername = toUsername;
  info.fromUsername = fromUsername;
  return compiled(info);
}

export default { parseXML, reply };
