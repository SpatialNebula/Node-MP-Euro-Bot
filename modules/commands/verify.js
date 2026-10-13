const discord = require("discord.js")
const roblox = require("../roblox.js")

const Users = require("./../mongodb/Users.js")

const { allowed_roles } = require("./../config.json");
const { model } = require("mongoose");

module.exports = {
    data: new discord.SlashCommandBuilder()
        .setName("verify")
        .setDescription("Verify")
        .addUserOption(option => 
            option.setName("target")
                .setDescription("The target user")
                .setRequired(false)
        )
        .setDMPermission(false),

    /**
    *
    * @param {discord.CommandInteraction} interaction
    */
    execute: async (interaction, logger) => {
        let permitted = false;
        for (role of allowed_roles) {
          if (!interaction.member.roles.cache.has(role)) continue;
          permitted = true;
          break;
        }
        if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}));

        const discordId = interaction.options.getMember("target").id ?? interaction.user.id
        const robloxId = await roblox.getUseridFromDiscordid(discordId)
        const robloxName = await roblox.getUsernamefromUserid(robloxId)

        const user = await Users.findOneAndUpdate({discordId}, {discordId, robloxId})
        if (user == null) await Users.create({discordId, robloxId})

        interaction.reply({ content: `Verified <@${discordId}> as ${robloxName} based on RoWiFi`, ephemeral: true })
    }
}