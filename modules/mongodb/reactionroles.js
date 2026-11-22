const mongoose = require("mongoose")

const reactionrolesSchema = mongoose.Schema({
    messageId: String,
    roleId: String,
})

const reactionroles = mongoose.model("reactionroles", reactionrolesSchema)

module.exports = reactionroles