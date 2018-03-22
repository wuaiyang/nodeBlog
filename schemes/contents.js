const mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({
    //关联字段
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    //标题
    title: String,
    //关联字段
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    addTime:{
        type: Date,
        default: new Date()
    },
    views: {
        type:Number,
        default:0
    },
    //简介
    descript:{
        type: String,
        default:''
    },
    //内容
    content:{
        type: String,
        default:''
    },

    //评论
    comments: {
        type: Array,
        default: []
    }
});

