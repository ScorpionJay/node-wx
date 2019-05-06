# 微信 oauth

## 接口解析

> 完整的链接

```
https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8dfda79a073efa18&redirect_uri=http://jay.aliyuntao.top/wx_oauth.html&response_type=code&scope=snsapi_userinfo&state=imusic
```

```
https://open.weixin.qq.com/connect/oauth2/authorize
微信oauth接口

appid
微信appId

redirect_uri
微信重定向的url，及微信的回调会带上一个code，通过此code可有拿到openId

response_type
类型

scope
范围

state
传参
```

## 注意点

网页帐号 网页授权获取用户基本信息 这里写的是域名

b1133725.ngrok.io

# REF

https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842

http://res.wx.qq.com/open/js/jweixin-1.4.0.js

http://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index

https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8dfda79a073efa18&redirect_uri=http://b1133725.ngrok.io/wx_oauth.html&response_type=code&scope=snsapi_base&state=imusic
