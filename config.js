/*!
 * todo - config.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

exports.debug = true;
exports.port = 3000;
exports.email = 'fengmk2@gmail.com';
exports.site_name = 'Node TODO';
exports.site_desc = 'Very simple todo, demo for connect web dev.';
exports.session_secret = 'todo session secret';

exports.db ={
    host: 'japan.cnqxo1udr78c.ap-northeast-1.rds.amazonaws.com',
    user: 'yeenuo',
    password: 'MUsec34#$',
    database:'japan',
    port: 3306
};