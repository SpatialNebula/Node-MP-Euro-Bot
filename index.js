const fs = require("node:fs");
const discord = require("discord.js");

const config = require("./modules/config.json");
const messageContext = fs.readdirSync("./modules/messageContext");
const commands = {};

for (let i = 0; i < messageContext.length; i++) {
  const contextItem = messageContext[i];
  if (!contextItem.endsWith(".js")) continue;

  const command = require(`./modules/messageContext/${contextItem}`);
  commands[command.data.name] = command.execute;
}

const client = new discord.Client({
  intents: [],
});

client.on("interactionCreate", (interaction) => {
  if (interaction.isMessageContextMenuCommand) {
    if (!commands[interaction.commandName])
      return interaction.reply({ content: "Unknown Command", ephemeral: true });

    try {
      commands[interaction.commandName](interaction);
    } catch (err) {
      interaction.reply({ content: err, ephemeral: true });
      console.warn(err);
    }
  }
});

client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  process.send('ready');
});

process.on("SIGINT", () => {
  client.destroy(() => {
    process.exit(0);
  });
});

client.login(config.token);
