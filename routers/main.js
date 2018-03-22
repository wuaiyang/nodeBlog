const express = require('express');
const router = express.Router();

const Category = require('../models/category');
const Content = require('../models/content');

let data;

//处理通用数据
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: [],
    };

    Category.find().then(function (categories) {

        data.categories = categories;
        next();

    })
});

router.get('/', function (req, res, next) {

    let pageAll = 0;
    let pageSize = 4;

    data.pageNow = Number(req.query.page || 1);
    data.category = req.query.category || '';
    data.pages = [];
    data.contents = [];

    let where = {};
    if(data.category) {
        where.category = data.category
    }

    Content.where(where).count().then(function (count) {

        pageAll = Math.ceil(count / pageSize);
        for (let i = 0; i < pageAll; i++) {
            data.pages.push(i + 1);
        }
        data.pageNow = Math.min(data.pageNow, pageAll);
        data.pageNow = Math.max(data.pageNow, 1);
        let skip = (data.pageNow - 1) * pageSize;
        return Content.where(where).find().sort({addTime: -1}).limit(pageSize).skip(skip).populate(['category', 'user'])
    }).then(function (contents) {
        data.contents = contents;
        res.render('main/index', data);
    });
});

router.get('/view', function (req, res) {
    let contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function (content) {
        data.content = content;

        content.views ++;
        content.save();

        res.render('main/view', data)
    });
});



module.exports = router;