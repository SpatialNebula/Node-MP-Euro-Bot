const fs = require("node:fs");
const discord = require("discord.js")
const messageContext = fs.readdirSync("./modules/messageContext");

const {clientId, token} = require("./modules/config.json")

const commands = [];

for(let i = 0; i < messageContext.length; i++){
    const contextItem = messageContext[i];
    if(!contextItem.endsWith(".js")) continue;

    const command = require(`./modules/messageContext/${contextItem}`);
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

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();