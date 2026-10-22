const discord = require("discord.js")
const CSIDatabase = require("./../google/CSIDatabase.js")
const SentReminders = require("../mongodb/sentreminders.js")

/**
 * 
 * @param {discord.Client} client
 * @param {String} channelId
 * @param {Array} users 
 * @param {Number} accentColor
 */

function getDayAndHour(offsetHours = 1, date = new Date()) {
    const local = new Date(date.getTime() + offsetHours * 3600000);
    const day = (local.getUTCDay() + 6) % 7; // Monday = 0

    return {
        day,
        hour: local.getUTCHours(),
    };
}

async function sendReminderToSection(client, channelId, users, accentColor) {
    if (users.length == 0) return;
    const targetChannel = await client.channels.cache.get(channelId)

    let toptext = ""
    toptext += "## Quota Reminder\n"
    toptext += "Remember to finish quota or feel free to submit an exemption if needed. Below are your current stats:"

    let bottomtext = ""
    for (let i in users) {
        let user = users[i]

        if ("discordId" in user && user.discordId != null) {
            bottomtext += `<@${user.discordId}> (events: ${user.events}, total: ${user.ap})`
        } else {
            bottomtext += `${user.username} (events: ${user.events}, total: ${user.ap})`
        };

        if (i < users.length - 1) bottomtext += ",\n";
    }

    const textContainer = new discord.ContainerBuilder()
        .setAccentColor(accentColor)
        .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(toptext))
        .addSeparatorComponents(new discord.SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(bottomtext));

    if (channelId == "1552012945590845520") {
        const targetThread = await targetChannel.threads.cache.get("1558187782743261224")
        await targetThread.send({ components: [textContainer], flags: [discord.MessageFlags.IsComponentsV2] })
    } else {
        await targetChannel.send({ components: [textContainer], flags: [discord.MessageFlags.IsComponentsV2] })
    }

}

module.exports = {
    enabled: true,

    /**
     * 
     * @param {discord.Client} client 
     */
    async execute(client) {
        const {hour: hour_oc, day: day_oc} = getDayAndHour(9) // JST
        const {hour: hour_eu, day: day_eu} = getDayAndHour(1) // CET/BST
        const {hour: hour_am, day: day_am} = getDayAndHour(-6)// idk
        
        if (day_oc <= 2) return;

        const csidatabase = new CSIDatabase()
        await csidatabase.initWeek()
        const quotaWeek = csidatabase.currentWeek
        let sentreminder = await SentReminders.findOne({ date: quotaWeek })
        if (sentreminder == null) sentreminder = await SentReminders.create({ date: quotaWeek, done_eu: false, done_am: false, done_oc: false });

        if ((sentreminder.done_eu == true || day_eu <= 2 || hour_eu <= 7) && (sentreminder.done_am == true || day_am <= 2 || hour_am <= 7) && (sentreminder.done_oc == true || day_oc <= 2 || hour_oc <= 7)) return;

        await csidatabase.initUsers()
        const users = csidatabase.users.filter(m => m.status == "Incomplete" || m.status == "In Progress")
        const usersBySection = users.reduce((acc, user) => {
            (acc[user.section] ??= []).push(user);
            return acc;
        }, {});


        if (sentreminder.done_am == false && day_am > 2 && hour_am > 7) {
            await sendReminderToSection(client, "678576710517784586", usersBySection["American"], 13386021)
            sentreminder.done_am = true
        }
        
        if (sentreminder.done_eu == false && day_eu > 2 && hour_eu > 7) {
            await sendReminderToSection(client, "678577079402496030", usersBySection["European"], 6989903)
            sentreminder.done_eu = true
        }
        if (sentreminder.done_oc == false && day_oc > 2 && hour_oc > 7) {
            await sendReminderToSection(client, "678577413428477953", usersBySection["Oceanic"], 7317724)
            sentreminder.done_oc = true
        }

        await sentreminder.save()
    }
}