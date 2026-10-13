const discord = require("discord.js")
const button = require("./../buttons/resetdatabasebtn")
const CSIDatabase = require("./../google/CSIDatabase.js")

module.exports = {
    enabled: true,

    /**
     * 
     * @param {discord.Client} client 
     */
    async execute(client){
        const csidatabase = new CSIDatabase()
        await csidatabase.initWeek()

        const dateString = csidatabase.currentWeek
        const [month, day, year] = dateString.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        const date_now = new Date()

        const diffInDates = Math.floor((date_now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffInDates < 8) return;
        
        // Chiefs Workspace: 1552012945590845520 -- Officer Management: 1474130376875048980
        const targetChannel = await client.channels.cache.get("1552012945590845520")
        const targetThread = await targetChannel.threads.cache.get("1558187782743261224")
        const actionRow = new discord.ActionRowBuilder()
            .addComponents(button.data);
        
        await targetThread.send({
            content: "`<@&1279727030715416682>`\nThe Officer DB is ready to be reset!",
            components: [actionRow]
        })
    }
}