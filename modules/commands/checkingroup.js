const discord = require("discord.js");
const { rowifi_token, rowifi_guild } = require("./../config.json");

function mapMembers(role){
    return role.members.map(m => m.id)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getRobloxMembers(cursor=""){
    console.log("Getting Roblox Members")
    const roblox_response = await fetch(`https://groups.roblox.com/v1/groups/3497030/users?limit=100&cursor=${cursor}`)

    if (!roblox_response.ok) {
        throw new Error(`Roblox Error: \`${roblox_response.statusText}\``);
    }

    const roblox_data = await roblox_response.json()
    const applicable = roblox_data.data.filter(data => data.role.rank <= 1).map(data => data.user)

    await sleep(500)

    if (roblox_data["nextPageCursor"]) {
        const nextPageMembers = await getRobloxMembers(roblox_data["nextPageCursor"])
        return applicable.concat(nextPageMembers)
    }

    return applicable
}

module.exports = {
    data: new discord.SlashCommandBuilder()
        .setName("checkingroup")
        .setDescription("self explanatory")
        .setDefaultMemberPermissions(discord.PermissionFlagsBits.BanMembers)
        .setDMPermission(false),

    /**
    *
    * @param {discord.CommandInteraction} interaction
    */
    execute: async (interaction) => {
        await interaction.guild.members.fetch()
        const EN = await interaction.guild.roles.fetch("475316400991371285")
        const PC = await interaction.guild.roles.fetch("478622382311997455")
        const SC = await interaction.guild.roles.fetch("490617704919728138")
        const  E = await interaction.guild.roles.fetch("478622591461097474")
        const SE = await interaction.guild.roles.fetch("478622810873266176")
        const  M = await interaction.guild.roles.fetch("467300782086029312")
        const guildMembers = mapMembers(EN).concat(mapMembers(PC)).concat(mapMembers(SC)).concat(mapMembers(E)).concat(mapMembers(SE)).concat(mapMembers(M))

        let notInGroup = [];
        let userIdsNotInGroup = [];
        let inGroup = [];

        interaction.reply({ephemeral: false, content: `Checking 0/${guildMembers.length} discord users. May take approximately ${Math.ceil((0.5*guildMembers.length)/60)} minutes total.`})

        for(i in guildMembers){
            await sleep(1000)

            const rowifi_response = await fetch(
                `https://api.rowifi.xyz/v2/guilds/${rowifi_guild}/members/${guildMembers[i]}`,
                {
                    headers: new Headers([["Authorization", `Bot ${rowifi_token}`]]),
            });
        
            if (!rowifi_response.ok) {
                console.log(`[${i}]\t    N/A  \tD${guildMembers[i]}\t\`${rowifi_response.statusText}\``)
                continue;
            }

            const rowifi_data = await rowifi_response.json();
            
            const roblox_response = await fetch(`https://groups.roblox.com/v2/users/${rowifi_data.roblox_id}/groups/roles`)

            if (!roblox_response.ok) {
              throw new Error(`Roblox Error: \`${roblox_response.statusText}\``);
            }

            const roblox_data = await roblox_response.json()
            const filteredGroups = roblox_data.data.filter(group => group.group.id == "3497030")

            let current = `[${i}]\tR${rowifi_data.roblox_id}\tD${guildMembers[i]}\tG`

            if (filteredGroups.length < 1) {current += "false"; userIdsNotInGroup.push(guildMembers[i]); notInGroup.push(current)} else {current += "true", inGroup.push(rowifi_data.roblox_id)};
            console.log(current)

            interaction.editReply({ephemeral: false, content: `Checking ${(parseInt(i)+1)}/${guildMembers.length} discord users. May take approximately ${Math.ceil((guildMembers.length)/60)} minutes total.\n\nFlagged not in group: <@${userIdsNotInGroup.join(">, <@")}>`})
        }

        interaction.editReply({ephemeral: false, content: `Fetching all roblox members...\n\nFlagged not in group: <@${userIdsNotInGroup.join(">, <@")}>`})
        let robloxMembers = await getRobloxMembers();
        interaction.editReply({ephemeral: false, content: `Filtering roblox members...\n\nFlagged not in group: <@${userIdsNotInGroup.join(">, <@")}>`})
        let notInDiscord = robloxMembers.filter(member => !inGroup.includes(member.userId)).map(member => member.username)
        interaction.editReply({ephemeral: false, content: `Fetching all roblox members...\n\nFlagged not in group: <@${userIdsNotInGroup.join(">, <@")}>\n\nFlagged not in discord: \`${notInDiscord.join("`, `")}\``})
    }
}