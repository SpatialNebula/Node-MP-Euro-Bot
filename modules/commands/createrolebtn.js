const discord = require("discord.js")
const mongoose = require("mongoose");

const button = require("../buttons/reactionrole.js")
const { allowed_roles } = require("../config.json");
const reactionroles = require("../mongodb/reactionroles.js");

module.exports = {
    data: new discord.SlashCommandBuilder()
        .setName("createrolebtn")
        .setDescription("Create a role button in a specified channel")
        .addRoleOption(option => 
            option.setName("targetrole")
                .setDescription("The target role")
                .setRequired(true)
        )
        .addChannelOption(option => 
            option.setName("targetchannel")
                .setDescription("The channel where to post")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("description")
                .setDescription("The description")
                .setRequired(true)
        )
        .setDMPermission(false),

    /**
    *
    * @param {discord.CommandInteraction} interaction
    */
    execute: async (interaction, logger) => {
        let permitted = false;
        for (let role of ["714317612246630440", "1541194392692461629"]) {
          if (!interaction.member.roles.cache.has(role)) continue;
          permitted = true;
          break;
        }

        if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}));

        const targetRole = interaction.options.getRole("targetrole");
        const targetChannel = interaction.options.getChannel("targetchannel");
        const description = interaction.options.getString("description");

        const textContainer = new discord.ContainerBuilder()
            .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`**Role Button for ${targetRole.name}**\n${description}`));

        const actionRow = new discord.ActionRowBuilder()
            .addComponents(button.data);

        const sentMessage = await targetChannel.send({
            components: [textContainer, actionRow],
            flags: [discord.MessageFlags.Ephemeral, discord.MessageFlags.IsComponentsV2]
        })

        await reactionroles.create({
            messageId: `${sentMessage.id}`,
            roleId: `${targetRole.id}`
        });

        interaction.reply({ content: `Sent the message to <#${targetChannel.id}> for ${targetRole.name}` })
    }
}