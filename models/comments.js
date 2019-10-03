var mongoose = require("mongoose");
var commentsSchema = new mongoose.Schema({
  text: String,
  author: String
});

module.exports = mongoose.model("Comment",commentsSchema)
