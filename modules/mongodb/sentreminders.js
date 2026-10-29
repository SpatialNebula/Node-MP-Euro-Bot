const mongoose = require("mongoose")

const sentremindersSchema = mongoose.Schema({
    date: String,
    done_eu: Boolean,
    done_am: Boolean,
    done_oc: Boolean,
    done_sunday: false,
})

const SentReminders = mongoose.model("sentreminders", sentremindersSchema)

module.exports = SentReminders