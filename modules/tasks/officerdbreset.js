const discord = require("discord.js")
const button = require("./../buttons/resetdatabasebtn")
const CSIDatabase = require("./../google/CSIDatabase.js")
const SentResets = require("./../mongodb/sentresets.js")

function getEasternTime() {
    const now = new Date();
    const estString = now.toLocaleString("en-US", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    const [datePart, timePart] = estString.split(", ");
    const [month, day, year] = datePart.split("/");
    const [hour, minute, second] = timePart.split(":");
    return new Date(year, month - 1, day, hour, minute, second);
}

module.exports = {
    enabled: true,

    /**
     * 
     * @param {discord.Client} client 
     */
    async execute(client) {
        const csidatabase = new CSIDatabase()
        await csidatabase.initWeek()

        const dateString = csidatabase.currentWeek
        const [month, day, year] = dateString.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        const date_now = getEasternTime()

        const diffInDates = Math.floor((date_now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffInDates < 7) return;

        const sentreset = await SentResets.findOne({date: dateString, type: "oc"})
        if (sentreset != null) return;

        // Chiefs Workspace: 1552012945590845520 -- Officer Management: 1474130376875048980
        const targetChannel = await client.channels.cache.get("1474130376875048980")
        const actionRow = new discord.ActionRowBuilder()
            .addComponents(button.data);

        await targetChannel.send({
            content: "`<@&1466919839548313756>`\nThe Officer DB is ready to be reset",
            components: [actionRow]
        })

        await SentResets.create({date: dateString, type: "oc", done: false})
    }
}