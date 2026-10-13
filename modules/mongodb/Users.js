const mongoose = require("mongoose")

const usersSchema = mongoose.Schema({
    discordId: String,
    robloxId: String
})

const Users = mongoose.model("users", usersSchema)

module.exports = Users