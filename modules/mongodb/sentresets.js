const mongoose = require("mongoose")

const sentresetsSchema = mongoose.Schema({
    date: String,
    type: String,
    done: Boolean
})

const SentResets = mongoose.model("sentresets", sentresetsSchema)

module.exports = SentResets