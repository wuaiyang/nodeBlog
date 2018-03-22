const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Content = require('../models/content');

let responseData;

router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: '',
    };

    next();
});

//用户注册
router.post('/user/register', function (req, res, next) {

    let username = req.body.username;
    let password = req.body.password;
    let repassword = req.body.repassword;

    if (username == '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    if (password != repassword) {
        responseData.code = 3;
        responseData.message = '密码不一致';
        res.json(responseData);
        return;
    }

    //与数据库对比用户名是否已经被注册
    User.findOne({
        username: username
    }).then(function (useInfo) {

        if (useInfo) {
            responseData.code = 4;
            responseData.message = '用户名已存在';
            res.json(responseData);
            return;
        }

        var mdpassword = hashPass(password);

        var user = new User({
            username: username,
            password: mdpassword
        });
        return user.save();

    }).then(function (newuseInfo) {

        responseData.message = '注册成功';
        res.json(responseData);
    });

});

//用户登陆
router.post('/user/login', function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    if (username == '') {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    if (password == '') {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    var mdpassword = hashPass(password);

    //查询相同用户名和密码的记录是否存在
    User.findOne({
        username: username,
        password: mdpassword
    }).then(function (userInfo) {
        if (!userInfo) {
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        responseData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username,
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username,
        }));
        responseData.message = '登陆成功';
        res.json(responseData);
    })

});

//用户退出
router.get('/user/logout', function (req, res, next) {

    req.cookies.set('userInfo', null);
    responseData.message = '退出成功';
    res.json(responseData);

});

//获取评论
router.get('/comment', function (req, res) {
    let contentId = req.query.contentId || '';

    Content.findOne({
        _id: contentId
    }).then(function (content) {
        responseData.data = content.comments;
        res.json(responseData);
    })
});

//评论提交
router.post('/comment/post', function (req, res) {
    let contentId = req.body.contentId || '';

    let postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前这篇内容的信息
    Content.findOne({
        _id: contentId
    }).then(function(content) {

        let array = content.comments;
        array.push(postData);
        content.comments = array;

        return content.save()

    }).then(function(newContent) {

        responseData.message = '评论成功';
        responseData.data = newContent.comments;
        res.json(responseData);
    });

});

function hashPass(password) {
    const crypto = require('crypto');
    const md5 = crypto.createHash('md5');
    let mdpassword = md5.update(password).digest('base64');
    return mdpassword;
}

module.exports = router;