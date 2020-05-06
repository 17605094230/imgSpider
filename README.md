####  爬取目标网站 [https://ocula.com](https://ocula.com) 一个Node.js图片爬虫程序,使用async并发控制库，async await语法
---

# 使用的库
```javascript
  "dependencies": {
    "merge-img": "^2.1.3",//合并图片
    "lodash": "^4.17.15",
    "async": "^2.1.4",//并发控制库
    "superagent": "^3.4.1",//http请求下载
    "superagent-charset": "^1.1.1"//superagent GBK编码支持
  }
  ```

# 运行
#### 由于使用了Async Await,需要Node.js 7.6及以上版本!
#### 需要Node.js 7.6及以上版本!
#### 需要Node.js 7.6及以上版本!
```
$ git clone https://github.com/sunbat/imgSpider.git
$ cd imgSpider
$ npm install
$ npm start
```