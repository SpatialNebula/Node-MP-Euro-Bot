const discord = require("discord.js")
const {developer_roles} = require("../config.json")
const mongoose = require("mongoose")
const uniReqs = require("../mongodb/uniformrequests")

module.exports = {
    data: new discord.ButtonBuilder()
        .setCustomId("acceptuniformrequest")
        .setLabel("Accept Request")
        .setStyle(discord.ButtonStyle.Success),

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
        if (uniReq.accepted == true) return interaction.followUp({content: `Uniform Request already accepted`, flags: [discord.MessageFlags.Ephemeral]});

        uniReq.lastInteractionTime = Date.now().toString();
        uniReq.accepted = true;

        await uniReq.save();

        interaction.followUp({content: `Uniform Request has been accepted, reminder in 14 days`});
    }
}