const discord = require("discord.js");

const { rowifi_token, rowifi_guild } = require("./../config.json");

async function getUsername(discordid) {

  // ##############
  // ### ROWIFI ###
  // ##############

  const rowifi_response = await fetch(
    `https://api.rowifi.xyz/v2/guilds/${rowifi_guild}/members/${discordid}`,
    {
      headers: new Headers([["Authorization", `Bot ${rowifi_token}`]]),
    }
  );

  if (!rowifi_response.ok) {
    throw new Error(
      `Rowifi Error: \`${rowifi_response.statusText}\` (Are you verified?)`
    );
  }

  const rowifi_data = await rowifi_response.json();

  // ##############
  // ### ROBLOX ###
  // ##############

  const roblox_response = await fetch(
    `https://users.roblox.com/v1/users/${rowifi_data.roblox_id}`
  );

  if (!roblox_response.ok) {
    throw new Error(`Roblox Error: \`${roblox_response.statusText}\``);
  }

  return (await roblox_response.json()).name;
}

module.exports = {
  data: new discord.ContextMenuCommandBuilder()
    .setName("Submit Euros")
    .setType(discord.ApplicationCommandType.Message),
  /**
   *
   * @param {discord.MessageContextMenuCommandInteraction} interaction
   */
  execute: async (interaction) => {
    if(!interaction.member.roles.cache.has('796794784341033041')) return interaction.reply({content: "Not Allowed", ephemeral: true})

    const channelId = interaction.targetMessage.channelId;
    const guildId = interaction.targetMessage.guildId;
    const messageId = interaction.targetMessage.id;

    let submissionType;
    switch (channelId) {
      case "1268612820082098282":
        submissionType = "Guest-help";
        break;
      case "862887007259459607":
        submissionType = "Guest-help";
        break;
      case "472469338360905738":
        submissionType = "Help-chat";
        break;
      case "1178541268381478912":
        submissionType = "Tyro-help";
        break;
      case "850017090877521940":
        submissionType = "PHR";
        break;
      default:
        return interaction.reply("Invalid Channel");
    }

    const roblox_name = await getUsername(interaction.user.id).catch((err) => {
      console.error(err);
      return interaction.reply({ ephemeral: true, content: err.message });
    });

    const form_response = await fetch(
      "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdxBtv6gP7Gc-VP2zIFGNIU-V35vid3SBlnvOeqcMpcnKhABw/formResponse",
      {
        method: "POST",
        headers: new Headers([
          ["Content-Type", "application/x-www-form-urlencoded"],
        ]),
        body: `entry.1063261469=${roblox_name}&entry.537377005=https://discord.com/channels/${guildId}/${channelId}/${messageId}&entry.780508841=${submissionType}`,
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
