const mongoose = require("mongoose")

const usersSchema = mongoose.Schema({
    discordId: String,
    robloxId: String,
    lastEdited: String
})

const Users = mongoose.model("users", usersSchema)

module.exports = Users