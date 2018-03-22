"use strict";
const express = require('express');
//加载模板
const swig = require('swig');
const mongoose = require('mongoose');
//处理post提交过来的数据
const bodyParser = require('body-parser');
const Cookies = require('cookies');

const User = require('./models/user');

const app = express();

//配置模板,定义模板引擎，使用swig.renderFile方法解析html文件
app.engine('html', swig.renderFile);
app.set('views', './views');
app.set('view engine', 'html');

//开发过程中，取消缓存，方便模板修改
swig.setDefaults({cache: false});

//静态文件托管
app.use(express.static(__dirname + '/public'));

//首页
/*app.get('/',function (req, res, next) {
    //res.send('<h1>Welcome</h1>')
    res.render('index');
});*/

//bodyparser设置
app.use(bodyParser.urlencoded({extended:true}));
//coockie设置
app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    req.userInfo = {};

    if(req.cookies.get('userInfo')){
       try{
           req.userInfo = JSON.parse(req.cookies.get('userInfo'));

           //获取当前登陆用户的用户类型
           User.findById(req.userInfo._id).then(function (userInfo) {
               req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
               next();
           })
       }catch (e){
           next();
       }
    } else {
        next();
    }


});


//根据不同的功能划分模块
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));

/*mongoose.connect('mongdb://localhost:27017/blog',
    err => {
        if (err) {
           conssole.log('数据库连接失败！');
        } else {
            conssole.log('数据库连接成功！');
        }
    }
);*/

let dbUrl = 'mongodb://localhost/blog';
mongoose.connect(dbUrl);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', function (err) {
    console.log('Mongo Error:' + err);
}).on('open', function () {
    console.log('Connection opened');
    app.listen(3030);
});
/*
mongoose.connect(dbUrl,function (err) {
    if(err){
        console.log('数据库连接失败')
    } else {
        console.log('数据库连接成功');
        app.listen(3030);
    }
});
*/


