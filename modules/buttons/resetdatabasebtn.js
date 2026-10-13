const discord = require("discord.js")
const { developer_roles } = require("./../config.json")

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
        if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}));

        interaction.reply({content: "test", ephemeral: true})
    }
}