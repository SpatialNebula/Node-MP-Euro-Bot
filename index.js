const fs = require("node:fs");
const discord = require("discord.js");
const winston = require("winston");

const mongoose = require("mongoose");

const messageContext = fs.readdirSync("./modules/messageContext");
const commandDir = fs.readdirSync("./modules/commands");
const buttonDir = fs.readdirSync("./modules/buttons");
const commands = {};

// Logging
const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.File({ filename: "server.log", format: winston.format.json() }),
        new winston.transports.Console({ format: winston.format.combine(winston.format.simple(), winston.format.colorize()) })
    ]
});

// Configuration Validation
if (!fs.existsSync("./modules/config.json")) {
    logger.error("file './modules/config.json' does not exist!");
    process.exit(1);
}

const config = require("./modules/config.json");
for (validator of ["token", "rowifi_token", "rowifi_guild", "allowed_roles", "mongodb_user", "mongodb_passwd", "mongodb_host", "mongodb_port"]) {
    if (config[validator]) continue;
    logger.error(`'./modules/config.json' has no '${validator}'!`)
    process.exit(1);
}

// MongoDB
(async () => {
    await mongoose.connect(`mongodb://${config.mongodb_user}:${config.mongodb_passwd}@${config.mongodb_host}:${config.mongodb_port}/MPAdminBot`).catch(e => {
        logger.error("Failed to log into MongoDB")
        process.exit(1)
    })

    logger.info("Connected to MongoDB")
})()

// Context Saving
for (let i = 0; i < messageContext.length; i++) {
    const contextItem = messageContext[i];
    if (!contextItem.endsWith(".js")) continue;

    const command = require(`./modules/messageContext/${contextItem}`);
    commands[command.data.name] = command.execute;
}
// Command Saving
for (let i = 0; i < commandDir.length; i++) {
    const commandFile = commandDir[i];
    if (!commandFile.endsWith(".js")) continue;

    const command = require(`./modules/commands/${commandFile}`);
    commands[command.data.name] = command.execute;
}
// Button Saving
for (let i = 0; i < buttonDir.length; i++) {
    const commandFile = buttonDir[i];
    if (!commandFile.endsWith(".js")) continue;

    const command = require(`./modules/buttons/${commandFile}`);
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
client.on("interactionCreate", async (interaction) => {
    if (interaction.isMessageContextMenuCommand) {
        logger.info(`${interaction.commandName} executed by '${interaction.user.username}' (${interaction.user.id})`)

        if (!commands[interaction.commandName])
            return interaction.reply({ content: "Unknown Command, try restarting discord", ephemeral: true });

        try {
            await commands[interaction.commandName](interaction, logger);
        } catch (err) {
            if (interaction.deferred || interaction.replied) {
                interaction.followUp({ content: err.toString(), ephemeral: true });
            } else {
                interaction.reply({ content: err.toString(), ephemeral: true });
            }
            logger.error(err);
            console.log(err)
        }
    }
});
// Connected
client.on("clientReady", () => {
    logger.info(`${client.user.username} ready!`);
    if (process?.send) process.send('ready');
});
// Connection Lost
client.on("disconnect", () => {
    logger.error("Client disconnected, exiting...");
    process.exit(5);
});
// Process Interrupted
process.on("SIGINT", async () => {
    await mongoose.disconnect().catch(e => logger.error(e))
    await client.destroy().catch(e => logger.error(e))
    logger.info("Exiting gracefully...")
    process.exit(0)
});
// Login
client.login(config.token);
