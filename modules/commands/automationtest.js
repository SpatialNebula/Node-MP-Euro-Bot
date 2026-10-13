const discord = require("discord.js");
const CSIDatabase = require("./../google/CSIDatabase.js")

const { developer_roles } = require("./../config.json");

module.exports = {
    data: new discord.SlashCommandBuilder()
        .setName("automationtest")
        .setDescription("automationtest")
        .setDMPermission(false),

    /**
    *
    * @param {discord.CommandInteraction} interaction
    */
    execute: async (interaction) => {
        let permitted = false;
        for (role of developer_roles) {
          if (!interaction.member.roles.cache.has(role)) continue;
          permitted = true;
          break;
        }
        if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}));

        interaction.deferReply({ephemeral: false})

        const csidatabase = new CSIDatabase()
        await csidatabase.initUsers().catch(e => {throw Error("Failed to access the CSI database. No data was modified")})
        const usersStruck = await csidatabase.applyStrikes().catch(e => {throw Error(`Failed to apply strikes to the CSI database. Some data may have been modified. Error message: \`${e}\``)})
        
        let toptext = ""
        toptext += `## Officer DB Reset\n`
        toptext += `The Officer DB has been reset from the week of **${csidatabase.currentWeek}**.`
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