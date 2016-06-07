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
var crypto = require('crypto');
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

exports.data = function (req, res, next) {
    var me = this;
	var data = req.body;
	var id = parseInt(data.id);
	console.log(id);
	data.table = "`WK`.`T_WORK`";
	var func = function(rtn)
	{
		console.log(rtn);
		if(rtn.affectedRows == 1)
		{
			console.log("success");//post方式用此获得数据
			res.writeHead(200, {"Content-Type": "text/html;charset:utf-8"}); 
			if(!isNaN(parseInt(rtn.insertId)))
			{
				res.write("{success:true,id:"+rtn.insertId+",option:'a'}");
			}
			else
			{
				res.write("{success:true,option:'u'}");
			}
			
			res.end();
		}
	};
	if(data.option == "d")//删除
	{
		db.d(data,func);
	}
	else if(isNaN(id))
	{
		data.id = null;
		console.log("add:");//post方式用此获得数据
		console.log(data);//post方式用此获得数据
		db.i(data,func);
	}
	else
	{
		console.log("update:");//post方式用此获得数据
		console.log(data);//post方式用此获得数据
		db.u(data,func);
	}
	
};


exports.login = function (req, res, next) {
	var me = this;
	var data = req.body;
	var name = data.name;
	var pwd = crypt(data.password);
	var sql = "SELECT ID,ROLE FROM WK.T_USER WHERE EMPLOYEE =? and PASSWORD = ? and failedcount < ?"
    console.log(sql);
	console.log(name);
	console.log(pwd);
	var params = [name,pwd,10];
	db.q(sql,params,function(rows)
		{	
			var rtn = "{success:false}"
			if(rows.length>0)
			{
				// RowDataPacket { ID: 2, ROLE: null }
				console.log(rows);
				var data = JSON.parse(JSON.stringify(rows));
				rtn = "{success:true,user:"+data[0].ID+",role:"+data[0].ROLE+"}"
				req.session.user = data[0].ID;
			}
			res.writeHead(200, {"Content-Type": "text/html;charset:utf-8"}); 
			res.write(rtn);
			res.end();
		});
};

exports.list = function (req, res, next) {
	var me = this;
	var data = req.body;
	var month = data.month;
	var user = data.user;
	//month = "201606";
	//user = "1";
	//SELECT *  FROM WK.T_WORK WHERE SUBSTRING(date,1,6) = '201606' and EMPLOYEE = '1' 
	var sql = "SELECT * FROM WK.T_WORK WHERE SUBSTRING(date,1,6) =? and USER = ? ORDER BY date;"
	var params = [month,user];

    console.log(sql);
	db.q(sql,params,function(rows)
		{	
			var data = JSON.parse(JSON.stringify(rows));
			res.writeHead(200, {"Content-Type": "text/html;charset:utf-8"}); 
			res.write(JSON.stringify(exports.adata(month,data)));
			res.end();
		});
};

exports.adata =  function(month,datas)
{
	var cdata = [];
	var y =  Number(month.substring(0,4));//年份
	var m =  Number(month.substring(4,6));//月份
	var nm =  (m+1)%12;//下一个月
    var temp = new Date(y+"/"+nm+"/01");
	temp.setHours(temp.getHours() - 3);//推后三小时
    var days =  temp.getDate();//获取下月1号多少天
	var n_d = new Date().getDate();//获取当前日期
	var n_m = new Date().getMonth()+1;//获取当前月份
	console.log(n_m+"#"+m);
	for(var i=1;i<=days;i++)
	{

		var _day = i + "";
		if(i<10)
		{
			_day = "0" + _day;
		}
		var status = config.status.f;//未来
		var _d = month+_day;//获取日期
		if(exports.restdate(_d))//休息日，优先判断休息日
		{
			status = config.status.n;//不需要
		}
		else if(((n_d>=i)&&(n_m==m))||(n_m>m))//如果日子已过去,当前月份判断日子，以后月份全部
		{
			status = config.status.u;
		}
		//作成数据
		var obj = {"date":_d,"starttime":"0000","endtime":"0000","worktime":0,"reason":0,"rest":0,"confim":"0","validate":"0","memo":""};
		
		for(var j=0;j<datas.length;j++)
		{
			var date = datas[j].date;
			if(_d==date)
			{
				obj = datas[j];
				status = config.status.d;//已经编写
				datas.splice(j,1);
				break;
			}
		}
		obj.status = status;
		cdata.push(obj);
	}
	return cdata;
},

	//休息日
	exports.restdate = function(str) {
		var rtn = false;
		var a =  str.substring(0,4)+"-"+ str.substring(4,6)+"-" + str.substring(6,8);
		var _w = new Date(Date.parse(a)).getDay();
		if((_w == 6)||(_w == 0))
		{
			rtn = true;
		}
		
		return rtn;
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


function crypt(info)
{
	var content = info;
	var shasum = crypto.createHash('sha1');
	shasum.update(content);
	return shasum.digest('hex');
}