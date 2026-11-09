const mongoose = require("mongoose")

const uniReqSchema = mongoose.Schema({
    robloxName: String,
    discordName: String,
    subcategory: String,
    rank: String,
    uniforms: String,

    accepted: Boolean,
    sentLongReminder: Boolean,

    lastInteractionTime: String,
    currentInteraction: String,
})

const uniReqs = mongoose.model("uniformrequests", uniReqSchema)

module.exports = uniReqs