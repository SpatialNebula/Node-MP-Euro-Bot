const discord = require("discord.js");

const { rowifi_token, rowifi_guild, allowed_roles } = require("./../config.json");

async function getUsername(discordid, logger) {

  logger.debug(`Fetching ${discordid}'s username`)

  // ##############
  // ### ROWIFI ###
  // ##############

  const rowifi_response = await fetch(
    `https://api.rowifi.xyz/v2/guilds/${rowifi_guild}/members/${discordid}`,
    {
      headers: new Headers([["Authorization", `Bot ${rowifi_token}`]]),
    }
  );

  logger.debug(`RoWifi ${rowifi_response.status}: ${rowifi_response.body}`)

  if (!rowifi_response.ok) {
    throw new Error(
      `Rowifi Error ${rowifi_response.status}: \`${rowifi_response.statusText}\` (Rowifi is down or you are unverified...)`
    );
  }

  const rowifi_data = await rowifi_response.json();

  // ##############
  // ### ROBLOX ###
  // ##############

  const roblox_response = await fetch(
    `https://users.roblox.com/v1/users/${rowifi_data.roblox_id}`
  );

  logger.debug(`Roblox ${roblox_response.status}: ${roblox_response.body}`)

  if (!roblox_response.ok) {
    throw new Error(`Roblox Error ${roblox_response.status}: \`${roblox_response.statusText}\``);
  }

  const roblox_name = (await roblox_response.json()).name

  logger.debug(`${discordid}'s username is '${roblox_name}'`)

  return roblox_name;
}

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
    if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}))

    const channelId = interaction.targetMessage.channelId;
    const guildId = interaction.targetMessage.guildId;
    const messageId = interaction.targetMessage.id;
    const channelName = interaction.targetMessage.channel.name;
    let proof = "N/A"

    let submissionType;
    switch (channelId) {
      case "1268612820082098282":
        submissionType = "Guest-help";
        proof = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
        break;
      case "862887007259459607":
        submissionType = "Guest-help";
        proof = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
        break;
      case "472469338360905738":
        submissionType = "Help-chat";
        proof = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
        break;
      case "1178541268381478912":
        submissionType = "Tyro-help";
        proof = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
        break;
      case "850017090877521940":
        submissionType = "PHR";
        proof = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
        break;
      default:
        if(channelName.startsWith("ticket-")) {
          submissionType = "Ticket";
          proof = channelName
          break;
        }
        return interaction.reply({ephemeral: true, content: "Invalid Channel"});
    }

    const roblox_name = await getUsername(interaction.user.id, logger).catch((err) => {
      logger.error(err);
      return interaction.reply({ ephemeral: true, content: err.message });
    });

    const form_response = await fetch(
      "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdxBtv6gP7Gc-VP2zIFGNIU-V35vid3SBlnvOeqcMpcnKhABw/formResponse",
      {
        method: "POST",
        headers: new Headers([
          ["Content-Type", "application/x-www-form-urlencoded"],
        ]),
        body: `entry.1063261469=${roblox_name}&entry.537377005=${proof}&entry.780508841=${submissionType}`,
      }
    );

    if (!form_response.ok) {
      return interaction.reply({
        content: form_response.statusText,
        ephemeral: true,
      });
    }

    interaction.reply({
      content: `${submissionType} submitted.`,
      ephemeral: true,
    });
  },
};
