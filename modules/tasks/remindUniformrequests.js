const discord = require("discord.js")
const mongoose = require("mongoose")
const uniReqs = require("../mongodb/uniformrequests")

const acceptBtn = require("../buttons/acceptuniformrequest")
const completeBtn = require("../buttons/completeuniformrequest")
const rejectBtn = require("../buttons/rejectuniformrequest")

async function sendReminder(remindertext){
}

module.exports = {
    enabled: true,

    /**
     * 
     * @param {discord.Client} client 
     */
    async execute(client) {
        const uniformRequests = await uniReqs.find({});
        for (uniReq of uniformRequests) {
            const {robloxName, discordName, subcategory, rank, uniforms, accepted, sentLongReminder, lastInteractionTime} = uniReq;

            let timeToWait = 9999;
            if (accepted == false || sentLongReminder == true) timeToWait = 3;
            else timeToWait = 14;

            if (Date.now() - parseInt(lastInteractionTime) < timeToWait * 24 * 60 * 60 * 1000) return;

            let reminderText = "This request has not been accepted or rejected";
            if (accepted == true) reminderText = "This accepted request has not been completed";

            const targetChannel = await client.channels.cache.get("1552012945590845520");
            const targetThread = await targetChannel.threads.cache.get("1558187782743261224");
            const actionRow = new discord.ActionRowBuilder()
                .addComponents(acceptBtn.data, completeBtn.data, rejectBtn.data);

            const textContainer = new discord.ContainerBuilder()
                .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`### Uniform Funding ${timeToWait}d Reminder\n${reminderText}, <@&1556385054295326850>`))
                .addSeparatorComponents(new discord.SeparatorBuilder().setDivider(true))
                .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`**Username**\nRoblox: ${robloxName}\nDiscord: ${discordName}`))
                .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`**Subcategory**\nGroup: ${subcategory}\nRank: ${rank}`))
                .addTextDisplayComponents(new discord.TextDisplayBuilder().setContent(`**Uniform(s)**\n${uniforms}`));

            const currentInteraction = await targetChannel.send({components: [textContainer, actionRow], flags: [discord.MessageFlags.IsComponentsV2]});

            uniReq.lastInteractionTime = Date.now().toString();
            uniReq.currentInteraction = currentInteraction.id;
            if (accepted == true) uniReq.sentLongReminder = true;

            await uniReq.save();
        }
    }
}