const fs = require("node:fs");
const discord = require("discord.js");
const winston = require("winston");

const config = require("./modules/config.json");
const messageContext = fs.readdirSync("./modules/messageContext");
const commandDir = fs.readdirSync("./modules/commands");
const commands = {};

// Logging
const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.File({filename: "server.log", format: winston.format.json()}),
    new winston.transports.Console({format: winston.format.combine(winston.format.simple(), winston.format.colorize())})
  ]
});

// Context Saving
for (let i = 0; i < messageContext.length; i++) {
  const contextItem = messageContext[i];
  if (!contextItem.endsWith(".js")) continue;

  const command = require(`./modules/messageContext/${contextItem}`);
  commands[command.data.name] = command.execute;
}
// Commnand Saving
for (let i = 0; i < commandDir.length; i++) {
  const commandFile = commandDir[i];
  if (!commandFile.endsWith(".js")) continue;

  const command = require(`./modules/commands/${commandFile}`);
  commands[command.data.name] = command.execute;
}
// Client Creation
const client = new discord.Client({
  intents: [
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildMembers
  ],
});
// Interaction Handling
client.on("interactionCreate", (interaction) => {
  if (interaction.isMessageContextMenuCommand) {
    logger.info(`${interaction.commandName} executed by '${interaction.user.username}' (${interaction.user.id})`)

    if (!commands[interaction.commandName])
      return interaction.reply({ content: "Unknown Command, try restarting discord", ephemeral: true });

    try {
      commands[interaction.commandName](interaction, logger);
    } catch (err) {
      interaction.reply({ content: err, ephemeral: true });
      logger.error(err);
    }
  }
});
// Connected
client.on("ready", () => {
  logger.info(`${client.user.username} ready!`);
  if(process?.send) process.send('ready');
});
// Connection Lost
client.on("disconnect", () => {
  logger.error("Client disconnected, exiting...");
  process.exit(5);
});
// Process Interrupted
process.on("SIGINT", () => {
  client.destroy(() => {
    process.exit(0);
  });
});
// Login
client.login(config.token);
