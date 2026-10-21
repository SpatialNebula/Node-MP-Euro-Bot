const discord = require("discord.js")
const roblox = require("../roblox.js")
const Users = require("../mongodb/Users.js")

module.exports = {
    enabled: false,

    /**
     * 
     * @param {discord.Client} client 
     */
    async execute(client) {
        const MP = client.guilds.cache.get("388061843031064576");
        await MP.members.fetch();

        const Inspector = MP.roles.cache.get("429707800197726229");
        const Inspectors = Inspector.members.map(m => m.id);

        const Superintendent = MP.roles.cache.get("422237888361791488");
        const Superintendents = Superintendent.members.map(m => m.id);

        const officers = [].concat(Inspectors).concat(Superintendents);

        for (let discordId of officers) {
            let dbEntry = await Users.findOne({discordId});
            
            if(dbEntry == null) dbEntry = new Users({discordId});
            
            if('lastEdited' in dbEntry && Date.now() - parseInt(dbEntry.lastEdited) < 2 * 24 * 60 * 60 * 1000) {
                continue;
            }

            dbEntry.lastEdited = Date.now().toString()

            try {
                const robloxId = await roblox.getUseridFromDiscordid(discordId)
                dbEntry.robloxId = robloxId

                await dbEntry.save()
            } catch(e) {
                console.log(`Failed to get roblox id for ${discordId}, ${e.toString()}`)
            }
        }
    }
}