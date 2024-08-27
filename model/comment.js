
const mongoose = require('mongoose');

const commentschema = new mongoose.Schema({
    userinfo: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    username:String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'post', required: true },
    comment: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // Parent comment
    rootId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },   // Top-level comment
});

module.exports = mongoose.model("Comment", commentschema);