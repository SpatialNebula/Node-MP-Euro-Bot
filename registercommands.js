const fs = require("node:fs");
const discord = require("discord.js")
const messageContext = fs.readdirSync("./modules/messageContext");
const commandDir = fs.readdirSync("./modules/commands");

if (!fs.existsSync("./modules/config.json")) {
  logger.error("file './modules/config.json' does not exist!");
  process.exit(1);
}

const config = require("./modules/config.json");
for (validator of ["token", "clientId"]) {
  if (config[validator]) continue;
  console.error(`'./modules/config.json' has no '${validator}'!`)
  process.exit(1);
}

const clientId = config.clientId
const token = config.token

const commands = [];

for(let i = 0; i < messageContext.length; i++){
    const contextItem = messageContext[i];
    if(!contextItem.endsWith(".js")) continue;

    const command = require(`./modules/messageContext/${contextItem}`);
    commands.push(command.data.toJSON())
}

for(let i = 0; i < commandDir.length; i++){
    const commandFile = commandDir[i];
    if(!commandFile.endsWith(".js")) continue;

    const command = require(`./modules/commands/${commandFile}`);
    commands.push(command.data.toJSON())
}

const rest = new discord.REST().setToken(token);
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

        await rest.put(
            discord.Routes.applicationCommands(clientId),
            { body: [] },
        );

		const data = await rest.put(
			discord.Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully refreshed ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();