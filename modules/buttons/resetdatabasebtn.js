const discord = require("discord.js")
const { developer_roles } = require("./../config.json")
const CSIDatabase = require("./../google/CSIDatabase.js")
const SentResets = require("./../mongodb/sentresets.js")

module.exports = {
    data: new discord.ButtonBuilder()
        .setCustomId("resetdatabasebtn")
        .setLabel("Reset Database")
        .setStyle(discord.ButtonStyle.Danger),

    /**
    *
    * @param {discord.CommandInteraction} interaction
    */
    execute: async (interaction, logger) => {
        let permitted = false;
        for (role of developer_roles) {
          if (!interaction.member.roles.cache.has(role)) continue;
          permitted = true;
          break;
        }
        for (role of [761067836201500685, 419709328069754880]) {
          if (!interaction.member.roles.cache.has(role)) continue;
          permitted = true;
          break;
        }
        if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}));

        interaction.deferReply({ephemeral: false})

        const csidatabase = new CSIDatabase()
        await csidatabase.initUsers().catch(e => {throw Error("Failed to access the CSI database. No data was modified")})

        const sentreset = await SentResets.findOne({date: csidatabase.currentWeek, type: "oc"})
        if(sentreset == null) return interaction.followUp({content: "Database already reset", flags: []});
        if(sentreset.done == true) return interaction.followUp({content: "Database already reset", flags: [discord.MessageFlags.Ephemeral]});
        sentreset.done = true;
        await sentreset.save();

        const usersStruck = await csidatabase.applyStrikes(true).catch(e => {throw Error(`Failed to apply strikes to the CSI database. Some data may have been modified. Error message: \`${e}\``)})
        
        let toptext = ""
        toptext += `## Officer DB Reset\n`
        toptext += `<@&1279727030715416682> The Officer DB has been reset from the week of **${csidatabase.currentWeek}**.`
        if (usersStruck.length > 0) toptext += ` The following officers have received a strike:\n`;

        usersStruck.sort((a, b) => {a.section.localeCompare(b.section)})
        for (user of usersStruck) {
            switch(user.section){
                case "European":
                    toptext += `<:${user.section}Crest:677128003649536010>`
                    break;
                case "American":
                    toptext += `<:${user.section}Crest:792099011070656555>`
                    break;
                case "Oceanic":
                    toptext += `<:${user.section}Crest:608153804353044495>`
                    break;
            }
            toptext += ` ${user.username} now has ${user.strikes} strikes\n`
        };

        let bottomtext = ""
        bottomtext += `\n### Weekly Message Template:\n`
        bottomtext += csidatabase.weeklyShout

        const textContainer = new discord.ContainerBuilder()
            .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(toptext))
            .addSeparatorComponents(new discord.SeparatorBuilder().setDivider(true))
            .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(bottomtext));

        interaction.followUp({components: [textContainer], flags: [discord.MessageFlags.IsComponentsV2]});
    }
}