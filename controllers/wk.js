/*!
 * wk - controllers/wk.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var config = require('../config');
var db = require('../db');

exports.app = function (req, res, next) {
	console.log("app");
	res.redirect('/public/index.html');
};

exports.new = function (req, res, next) {
  var title = req.body.title || '';
  title = title.trim();
  if (!title) {
    return res.render('error.html', {message: '标题是必须的'});//render jsp 生成模板
  }
  db.wk.save({title: title, post_date: new Date()}, function (err, row) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.view = function (req, res, next) {
  res.redirect('/');
};

exports.list = function (req, res, next) {
	var id = req.params.id;
	var sql = "SELECT * FROM japan.User;"
    db.q(sql,function(rows)
		{	
			res.writeHead(200, {"Content-Type": "text/html;charset:utf-8"}); 
			res.write(JSON.stringify(rows));
			console.log(rows);
			//console.log(sql);
			res.end();
		});
};

exports.edit = function (req, res, next) {
  var id = req.params.id;
  db.wk.findById(id, function (err, row) {
    if (err) {
      return next(err);
    }
    if (!row) {
      return next();
    }
    res.render('wk/edit.html', {wk: row});
  });
};

exports.save = function (req, res, next) {
  var id = req.params.id;
  var title = req.body.title || '';
  title = title.trim();
  if (!title) {
    return res.render('error.html', {message: '标题是必须的'});
  }
  db.wk.updateById(id, {$set: {title: title}}, function (err, result) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.delete = function (req, res, next) {
  var id = req.params.id;
  db.wk.removeById(id, function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.finish = function (req, res, next) {
  var finished = req.query.status === 'yes' ? 1 : 0;
  var id = req.params.id;
  db.wk.updateById(id, {$set: {finished: finished}}, function (err, result) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};