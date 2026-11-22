const discord = require("discord.js")
const {developer_roles} = require("../config.json");
const mongoose = require("mongoose")
const reactionroles = require("../mongodb/reactionroles.js");

module.exports = {
    data: new discord.ButtonBuilder()
        .setCustomId("reactionrole")
        .setLabel("Get or Remove Role")
        .setStyle(discord.ButtonStyle.Primary),

    /**
    *
    * @param {discord.CommandInteraction} interaction
    */
    execute: async (interaction, logger) => {
        let permitted = false;
        for (let role of developer_roles) {
            if (!interaction.member.roles.cache.has(role)) continue;
            permitted = true;
            break;
        }

        permitted = true;

        if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}));

        const botMember = interaction.member.guild.members.me;

        if (!(await botMember.permissions.has(discord.PermissionFlagsBits.ManageRoles))) {return interaction.reply({content: "I do not have permission to manage roles", flags: [discord.MessageFlags.Ephemeral]})};

        await interaction.deferReply({flags: [discord.MessageFlags.Ephemeral]});


        const reactionrole = await reactionroles.findOne({messageId: `${interaction.message.id}`});
        if (reactionrole == null) {return interaction.followUp({content: `This button is broken, please make another one`, flags: [discord.MessageFlags.Ephemeral]})};

        const role = await interaction.guild.roles.cache.get(reactionrole.roleId);
        if (role.position >= botMember.roles.highest.position) {return interaction.followUp({content: `I do not have permission to manage this role, move it down.`, flags: [discord.MessageFlags.Ephemeral]})}

        const member = interaction.member;
        const memberHasRole = await member.roles.cache.has(role.id);

        if (memberHasRole) {
            await member.roles.remove(role)
            interaction.followUp({content: `Removed <@&${role.id}>`, flags: [discord.MessageFlags.Ephemeral]});
        } else {
            await member.roles.add(role)
            interaction.followUp({content: `Added <@&${role.id}>`, flags: [discord.MessageFlags.Ephemeral]});
        }
    }
}