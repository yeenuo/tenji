var mysql = require('mysql');
var config = require("./config");
//连接数据库
var conn = mysql.createConnection(config.db)
conn.connect();

exports.new = function () {
	return mysql.createConnection(config.db);
};
exports.connect = function () {
	conn.connect();
};
exports.test = function () {
	var conn = mysql.createConnection(config.db);
	conn.connect();
	conn.query("SELECT token solution FROM japan.`User` where userId ='rfl'", function(err, rows, fields) {
    if (err) throw err;
		 console.log('The solution is: ', rows[0].solution);
	});
	conn.end();
};

exports.q = function (sql,func) {
	var rtn;
	conn.query(sql, function(err, rows, fields) {
		if (err) 
		{
			throw err;
		}
		console.log('The data record is: ', rows.length);
		func(rows);
	});
};