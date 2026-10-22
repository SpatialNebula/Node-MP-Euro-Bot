const discord = require("discord.js");
const roblox = require("../roblox.js");
const officersgreatest = require("../google/officersgreatest.js")

const { rowifi_token, rowifi_guild, allowed_roles } = require("./../config.json");

module.exports = {
    data: new discord.ContextMenuCommandBuilder()
        .setName("Submit Points")
        .setType(discord.ApplicationCommandType.Message),
    /**
     *
     * @param {discord.MessageContextMenuCommandInteraction} interaction
     */
    execute: async (interaction, logger) => {
        let permitted = false;
        for (role of allowed_roles) {
            if (!interaction.member.roles.cache.has(role)) continue;
            permitted = true;
            break;
        }
        if (!permitted) return (interaction.reply({ content: "Not Allowed", ephemeral: true }))

        const channelId = interaction.targetMessage.channelId;
        const guildId = interaction.targetMessage.guildId;
        const messageId = interaction.targetMessage.id;
        const channelName = interaction.targetMessage.channel.name;
        let proof = "N/A"

        let submissionType;
        switch (channelId) {
            case "862887007259459607":
                submissionType = "Guest-help";
                proof = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
                break;
            case "472469338360905738":
                submissionType = "Help-chat";
                proof = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
                break;
            default:
                if (channelName.startsWith("ticket-")) {
                    submissionType = "Ticket";
                    proof = channelName
                    break;
                }
                return interaction.reply({ ephemeral: true, content: "Invalid Channel" });
        }

        interaction.deferReply({ephemeral: true})

        const roblox_id = await roblox.getUseridFromDiscordid(interaction.user.id)
        const roblox_name = await roblox.getUsernamefromUserid(roblox_id)
        await officersgreatest.submitForm(roblox_name, proof, submissionType)

        interaction.followUp({
            content: `${submissionType} submitted.`,
            ephemeral: true,
        });
    },
};
