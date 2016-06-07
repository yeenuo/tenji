/*!
 * wk - app.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

require('./lib/patch');
var express = require('express');
var render = require('connect-render');
var urlrouter = require('urlrouter');
var config = require('./config');
var wk = require('./controllers/wk');
var session = require('express-session'); //如果要使用session，需要单独包含这个模块
var cookieParser = require('cookie-parser'); //如果要使用cookie，需要显式包含这个模块
var bodyParser = require("body-parser");
var csurf = require("csurf");
var serveStatic = require('serve-static');

var app = express();
//静态文件 存放HTML JS等等
app.use('/public',serveStatic(__dirname + '/public', {maxAge: 3600000 * 24 * 30}));
app.use(cookieParser());
app.use(express.query());
app.use(bodyParser.urlencoded({
  extended: true
}));
  //bodyParser用于解析客户端请求的body中的内容,内部使用JSON编码处理,url编码处理以及对于文件的上传处理.
 //将post参数解析成JSON化的req.body
app.use(bodyParser.json());
app.use(session({
		resave:false,//添加这行  
		saveUninitialized: true,//添加这行   
		secret: config.session_secret,  
		cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}//30 days  
	}));
//身份认证
app.use(csurf());
app.use(render({
  root: __dirname + '/views',
  layout: false,
  cache: config.debug, // `false` for debug
  helpers: {
    config: config,
    _csrf: function (req, res) {
      return req.session._csrf;
    }
  }
}));

/**
 * 页面转向
 */
var router = urlrouter(function (app) {
  app.get('/', wk.app);
  app.get('/wk/list', wk.list);
  app.post('/wk/list', wk.list);
  app.post('/wk/new', wk.new);//传递时地址转向
  app.get('/wk/:id', wk.view);
  app.get('/wk/:id/edit', wk.edit);
  app.post('/wk/:id/edit', wk.save);
  app.get('/wk/:id/delete', wk.delete);
  app.get('/wk/:id/finish', wk.finish);
  //app.get('/wk/:id/list', wk.list);
  //app.post('/wk/list', wk.list);
});
app.use(router);

app.listen(config.port);
console.log('Server start on ' + config.port);