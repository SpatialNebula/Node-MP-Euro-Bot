
const { rowifi_token, rowifi_guild, allowed_roles } = require("./config.json")

const toExport = {}

toExport.getUseridFromDiscordid = async (discordId) => {
    const rowifi_response = await fetch(
        `https://api.rowifi.xyz/v2/guilds/${rowifi_guild}/members/${discordId}`,
        {
            headers: new Headers([["Authorization", `Bot ${rowifi_token}`]]),
        }
    );

    if (!rowifi_response.ok) {
        throw new Error(`Rowifi Error ${rowifi_response.status}: \`${rowifi_response.statusText}\` (Rowifi is down or you are unverified...)`);
    }

    const rowifi_data = await rowifi_response.json();
    return rowifi_data.roblox_id;
}

toExport.getUsernamefromUserid = async (userId) => {
    const roblox_response = await fetch(`https://users.roblox.com/v1/users/${userId}`);

    if (!roblox_response.ok) {
        throw new Error(`Roblox Error ${roblox_response.status}: \`${roblox_response.statusText}\``);
    }

    const roblox_data = await roblox_response.json()
    return roblox_data.name
}

toExport.getUseridfromUsername = async (username) => {
    const roblox_response = await fetch(`https://users.roblox.com/v1/usernames/users`, {
        method: "POST",
        headers: {'Content-Type': "application/json"},
        body: `{"usernames": ["${username}"]}`
    });

    if (!roblox_response.ok) {
        throw new Error(`Roblox Error ${roblox_response.status}: \`${roblox_response.statusText}\``);
    }

    const roblox_data = await roblox_response.json()
    const roblox_results = roblox_data.data

    if (roblox_response.length < 1) {
        throw new Error(`Roblox Error ${roblox_response.status}: User Not Found`);
    }
    return roblox_data.data[0].id
}

module.exports = toExport