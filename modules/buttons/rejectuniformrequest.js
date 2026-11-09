const discord = require("discord.js")
const {developer_roles} = require("../config.json")
const mongoose = require("mongoose")
const uniReqs = require("../mongodb/uniformrequests")

module.exports = {
    data: new discord.ButtonBuilder()
        .setCustomId("rejectuniformrequest")
        .setLabel("Reject Request")
        .setStyle(discord.ButtonStyle.Danger),

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
        for (let role of ["1556385054295326850", "1541194392692461629"]) {
            if (!interaction.member.roles.cache.has(role)) continue;
            permitted = true;
            break;
        }

        if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}));
        await interaction.deferReply();

        const uniReq = await uniReqs.findOne({currentInteraction: interaction.message.id});
        if (uniReq == null) return interaction.followUp({content: `Uniform Request already completed, rejected, or moved into a reminder`, flags: [discord.MessageFlags.Ephemeral]});

        await uniReqs.findOneAndDelete({currentInteraction: interaction.message.id});

        interaction.followUp({content: `Uniform Request has been rejected, reminders cancelled`});
    }
}