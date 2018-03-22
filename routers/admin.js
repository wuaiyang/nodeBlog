var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        //非管理员
        res.send('您没有管理员权限');
        return;
    }
    next();
});

router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

//用户管理
const User = require('../models/user');
const Category = require('../models/category');
const Content = require('../models/content');

router.get('/user', function (req, res, next) {

    let pageSize = 4;
    let pageNow = Number(req.query.page || 1);

    let pageAll = 0;
    let pages = [];

    User.count().then(function (count) {
        pageAll = Math.ceil(count / pageSize);
        for (let i = 0; i < pageAll; i++) {
            pages.push(i + 1);
        }

        pageNow = Math.min(pageNow, pageAll);
        pageNow = Math.max(pageNow, 1);

        let skip = (pageNow - 1) * pageSize;

        User.find().limit(pageSize).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                pages: pages,
                page: pageNow
            });
        })
    });


    /*Promise.all([
        User.find(),
        User.find().limit(pageSize)
    ]).then(function (result) {

        let pagenumber = Math.ceil(result[0].length/pageSize);
        let pages = [];
        for(let i=0; i<pagenumber; i++){
            pages.push(i+1);
        }



        res.render('admin/user_index', {
            userInfo: req.userInfo,
            users:result[1],
            pages:pages,
            pageNow: pageNow
        });
    }).catch(next);*/
});

//分类首页
router.get('/category', function (req, res) {
    let pageSize = 4;
    let pageNow = Number(req.query.page || 1);

    let pageAll = 0;
    let pages = [];

    Category.count().then(function (count) {
        pageAll = Math.ceil(count / pageSize);
        for (let i = 0; i < pageAll; i++) {
            pages.push(i + 1);
        }

        pageNow = Math.min(pageNow, pageAll);
        pageNow = Math.max(pageNow, 1);

        let skip = (pageNow - 1) * pageSize;

        Category.find().sort({_id: -1}).limit(pageSize).skip(skip).then(function (categories) {
            res.render('admin/categoryIndex', {
                userInfo: req.userInfo,
                categories: categories,
                pages: pages,
                page: pageNow
            });
        })
    });
});

//分类添加
router.get('/category/add', function (req, res) {
    res.render('admin/categoryAdd', {
        userInfo: req.userInfo,
    })
});

//分类保存
router.post('/category/add', function (req, res, next) {

    let name = req.body.name || '';

    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空',
        });
        return;
    }

    Category.findOne({
        name: name
    }).then(function (result) {
        if (result) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '名称已经存在',
            });
            return Promise.reject();
        } else {
            var category = new Category({
                name: name
            });

            return category.save();
        }
    }).then(function (newCategory) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '保存成功',
            url: '/admin/category'
        })
    })
});

//分类修改
router.get('/category/edit', function (req, res, next) {
    let id = req.query.id || '';

    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类不存在',
            });
        } else {
            res.render('admin/categoryEdit', {
                userInfo: req.userInfo,
                category: category,
            });
        }
    })
});

//分类修改
router.post('/category/edit', function (req, res) {
    let id = req.query.id || '';
    let name = req.body.name || '';

    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类不存在',
            });
            return Promise.reject();
        } else {
            //当用户没有做修改时
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                //名称已经存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                })
            }

        }
    }).then(function (sameCategory) {
        if (sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在',
            });
            return Promise.reject();
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
        });
    })

});

//分类删除
router.get('/category/delete', function (req, res) {
    let id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        });
    });

});

//内容首页
router.get('/content', function (req, res) {
    let pageSize = 4;
    let pageNow = Number(req.query.page || 1);

    let pageAll = 0;
    let pages = [];

    Content.count().then(function (count) {
        pageAll = Math.ceil(count / pageSize);
        for (let i = 0; i < pageAll; i++) {
            pages.push(i + 1);
        }

        pageNow = Math.min(pageNow, pageAll);
        pageNow = Math.max(pageNow, 1);

        let skip = (pageNow - 1) * pageSize;

        Content.find().sort({_id: -1}).limit(pageSize).skip(skip).populate(['category','user']).then(function (contents) {
            res.render('admin/contentIndex', {
                userInfo: req.userInfo,
                contents: contents,
                pages: pages,
                page: pageNow
            });
        })
    });

});

//内容添加
router.get('/content/add', function (req, res) {

    Category.find().sort({_id: -1}).then(function (categories) {
        res.render('admin/contentAdd', {
            userInfo: req.userInfo,
            categories: categories
        });
    });


});

//内容添加
router.post('/content/add', function (req, res) {
    let category = req.body.category;
    let title = req.body.title;
    let descript = req.body.descript;
    let content = req.body.content;

    if (category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '分类不能为空',
        });
        return;
    }

    if (title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题不能为空',
        });
        return;
    }

    new Content({
        category: category,
        title: title,
        user: req.userInfo._id.toString(),
        descript: descript,
        content: content
    }).save().then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '保存成功',
            url: '/admin/content'
        });
    })

});

//分类修改
router.get('/content/edit', function (req, res) {
    let id = req.query.id || '';

    let categories = [];

    Category.find().sort({_id: -1}).then(function (rs) {

        categories = rs;

        return Content.findOne({
            _id: id
        }).populate('category');

    }).then(function (content) {
         console.log(content);
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类不存在',
            });
        } else {
            res.render('admin/contentEdit', {
                userInfo: req.userInfo,
                content: content,
                categories: categories
            });
        }
    });
});

//分类修改保存
router.post('/content/edit',function (req, res) {
    let id = req.query.id || '';
    let category = req.body.category;
    let title = req.body.title;
    let descript = req.body.descript;
    let content = req.body.content;


    if (category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '分类不能为空',
        });
        return;
    }

    if (title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题不能为空',
        });
        return;
    }

    Content.update({
       _id: id
    },{
        category: category,
        title: title,
        user: req.userInfo._id.toString(),
        descript: descript,
        content: content
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '保存成功',
            url: '/admin/content/edit?id='+id
        });
    })
});

//分类删除
router.get('/content/delete', function (req, res) {
    let id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        });
    });

});

module.exports = router;