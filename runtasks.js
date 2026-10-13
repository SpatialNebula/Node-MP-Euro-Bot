const fs = require("node:fs")
const path = require("node:path")
const mongoose = require("mongoose");
const discord = require("discord.js")

// Configuration Validation
if (!fs.existsSync("./modules/config.json")) {
    console.error("file './modules/config.json' does not exist!");
    process.exit(1);
}

const config = require("./modules/config.json");
for (validator of ["token", "mongodb_user", "mongodb_passwd", "mongodb_host", "mongodb_port"]) {
    if (config[validator]) continue;
    console.error(`'./modules/config.json' has no '${validator}'!`)
    process.exit(1);
}

const client = new discord.Client({
    intents: [
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMembers
    ],
});

async function run(){
    for (let task of fs.readdirSync(path.join(__dirname, "modules/tasks"))){
        try {
            const taskf = require(path.join(path.join(__dirname, "modules/tasks"), task))
            if (taskf.enabled == true) await taskf.execute(client);
            console.info(`Task ${task} executed successfully`)
        } catch (e) {
            console.error(`Task ${task} failed with error: ${e.toString()}`)
        }
    }
    await mongoose.disconnect()
    await client.destroy()
}

// MongoDB
(async () => {
    await mongoose.connect(`mongodb://${config.mongodb_user}:${config.mongodb_passwd}@${config.mongodb_host}:${config.mongodb_port}/MPAdminBot`).catch(e => {
        console.error("Failed to log into MongoDB")
        process.exit(1)
    })

    client.login(config.token);
    console.info("Connected to MongoDB")
})()
// Connected
client.on("clientReady", () => {
    console.info(`${client.user.username} ready!`);
    if (process?.send) process.send('ready');
    run()
});
// Connection Lost
client.on("disconnect", () => {
    console.error("Client disconnected, exiting...");
    process.exit(5);
});
// Process Interrupted
process.on("SIGINT", async () => {
    await mongoose.disconnect().catch(e => console.error(e))
    await client.destroy().catch(e => console.error(e))
    process.exit(0)
});
// Login


