# 过程

`ascii-art`

npm 一直在loading

卡在安装node-canvas

去看node-canvas的文档

[Windows安装的link](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows)

搞好了还是loading

进去debug一看

> node-pre-gyp WARN Using request for node-pre-gyp https download

node-pre-gyp 下载东西真的是龟速,这墙啊!

看看从哪下载

ip: 52.217.88.1:443

呵？亚马逊云？难怪龟速

开个全局代理搞定

或者

单独给npm 挂代理 .npmrc

```shell
npm config set proxy "https://127.0.0.1:10800"
```

## 很完美

开始写着玩吧

字符画一定要用```包裹，让他保持不转义

crontab
https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07