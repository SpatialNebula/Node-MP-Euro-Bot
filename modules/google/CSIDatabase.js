const { google } = require('googleapis');
const path = require("node:path")

const Users = require("./../mongodb/Users.js")
const roblox = require("./../roblox.js")

const SERVICE_ACCOUNT_AUTH_PATH = path.join(__dirname, "./service-account.json")
const SPREADSHEET_ID = "12cCyzgM-kEhsOHy-DG3tAdwkwv08Fo_XL8gRmA9N7Gs"

function addSevenDays(dateString) {
    const [month, day, year] = dateString.split('/').map(Number);

    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 7);

    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();

    return `${mm}/${dd}/${yyyy}`;
}

async function getRangeData(sheets, spreadsheetId, range) {
    const result = await sheets.spreadsheets.values.get({ spreadsheetId, range }).catch(err => { throw (err) })
    return result.data.values;
}

async function writeRangeData(sheets, spreadsheetId, range, data) {
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {values: data}
    }).catch(e => {throw new Error(`Failed to write updated data to CSI sheet ${range}`)})
}

/**
 * 
 * @param {Array} rawSheetRows 
 */
async function getUsersFromSheetRows(rawSheetRows) {
    const users = []
    for (let row in rawSheetRows) {
        if (row <= 3) continue
        const columns = rawSheetRows[row]
        if (columns.length != 24) {
            console.warn(`Skipped invalid row ${row}`)
            continue
        }

        const robloxId = await roblox.getUseridfromUsername(columns[0].toLowerCase().trim()).catch(() => null)
        const dbUser = await Users.findOne({ robloxId }) ?? null

        const user = {
            username: columns[0],
            rank: columns[1],
            strikes: columns[2],
            strikelog: columns[3],
            apps: columns[18],
            ap: columns[20],
            status: columns[21],
            section: columns[23],
            row: parseInt(row) + 4,
            discordId: dbUser?.discordId
        }
        users.push(user)
    }
    return users
}

/**
 * 
 * @param {Object} section 
 */
function sectionToEmoji(section) {
    switch (section) {
        case "European":
            return
    }
}

/**
 * 
 * @param {Array} users 
 * @param {String} placemedal
 */
function userArrToLeaderboardIndex(users, placemedal) {
    let message = ""
    let sections = new Set()
    for (let i in users) {
        if (users[i].discordId) {
            message += `<@${users[i].discordId}>`
        } else {
            message += users[i].username
        }

        if (i < users.length - 2) {
            message += ", "
        } else if (i == users.length - 2) {
            message += ", and "
        }

        sections.add(users[i].section)
    };
    message += ` with ${users[0].ap} AP ${placemedal}`
    for (let section of sections.keys()) message += `:${section}Crest:`;
    message += "\n"
    return message
}

class CSIDatabase {

    constructor() {
        this.auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_AUTH_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        })

        this.sheets = google.sheets({ version: 'v4', auth: this.auth })
        this.spreadsheetId = SPREADSHEET_ID

        this.users = null
        this.rawRows = null
    }

    async initUsers() {
        this.rawRows = await getRangeData(this.sheets, this.spreadsheetId, "AP Database!A4:X")
        this.CurrentWeek = await getRangeData(this.sheets, this.spreadsheetId, "Settings!A3:A3")
        this.users = await getUsersFromSheetRows(this.rawRows)
    }

    async initWeek() {
        this.CurrentWeek = await getRangeData(this.sheets, this.spreadsheetId, "Settings!A3:A3")
    }

    get currentWeek() {
        return this.CurrentWeek[0][0]
    }

    get topReviewers() {
        const topReviewers = []

        const users = this.users.toSorted((a, b) => { return parseInt(b.apps) - parseInt(a.apps) })
        for (let user in users) {
            if (users[user].apps == "0") {
                break
            } else if (user == 0) {
                topReviewers.push(users[user])
            } else if (users[user].apps == users[user - 1].apps) {
                topReviewers.push(users[user])
            }
        }

        return topReviewers
    }

    get topContributors() {
        const topAP = [[], [], []];

        let topAP_position = 0;
        let topAP_addedAUser = false;
        let topAP_lastUser = 0;

        const users = this.users.toSorted((a, b) => { return parseFloat(b.ap) - parseFloat(a.ap) })
        for (let user in users) {
            if (users[user].ap === "0") {
                break
            } else if (!(users[user].rank == "Inspector" || users[user].rank == "Superintendent")) {
                continue
            } else if (topAP_addedAUser === false || parseFloat(users[user].ap) == parseFloat(users[topAP_lastUser].ap)) {
                topAP[topAP_position].push(users[user])
                topAP_addedAUser = true
                topAP_lastUser = user
            } else if (topAP_position == 2) {
                break
            } else {
                topAP_position += 1
                topAP[topAP_position].push(users[user])
                topAP_lastUser = user
            }
        }

        return topAP;
    }

    get sectionStats() {
        const sectionStats = { "European": { ap: 0.0, officers: 0.0, avg: 0.0 }, "American": { ap: 0.0, officers: 0.0, avg: 0.0 }, "Oceanic": { ap: 0.0, officers: 0.0, avg: 0.0 } }
        for (let user of this.users) {
            if (user.status == "Exempt" || user.status == "M.Exempt" || user.status == "M. Exempt") continue;
            if (user.section == "European" || user.section == "American" || user.section == "Oceanic") {
                sectionStats[user.section].ap += parseFloat(user.ap)
                sectionStats[user.section].officers += 1.0
            }
        }
        sectionStats["European"].avg = parseFloat(sectionStats["European"].ap / sectionStats["European"].officers || 0.0).toFixed(2);
        sectionStats["American"].avg = parseFloat(sectionStats["American"].ap / sectionStats["American"].officers || 0.0).toFixed(2);
        sectionStats["Oceanic"].avg = parseFloat(sectionStats["Oceanic"].ap / sectionStats["Oceanic"].officers || 0.0).toFixed(2);

        const sortedSections = Object.entries(sectionStats).map(([key, value]) => ({ key, value: parseFloat(value.avg) })).sort((a, b) => b.value - a.value);
        const topSections = [];

        for (let section in sortedSections) {
            if (section == 0) {
                topSections.push(sortedSections[section].key)
            } else if (sortedSections[section].value == sortedSections[section - 1].value) {
                topSections.push(sortedSections[section].key)
            } else {
                break
            };
        }

        return { sectionStats, topSections }
    }

    get weeklyShout() {
        const topAP = this.topContributors
        const topReviewers = this.topReviewers
        const { sectionStats, topSections } = this.sectionStats

        let message = "```\n@everyone\n\n**[Officer/Sectional Acknowledgements]**\n\nHello everyone!\n\n"

        if (topAP[0].length == 0) {
            message += "No AP.\n\n"
        } else {
            message += `**#1** - `
            message += userArrToLeaderboardIndex(topAP[0], ":first_place:")
            if (topAP[1].length > 0) message += `**#2** - ${userArrToLeaderboardIndex(topAP[1], ":second_place:")}`
            if (topAP[2].length > 0) message += `**#3** - ${userArrToLeaderboardIndex(topAP[2], ":third_place:")}\n\n`
        }

        if (topReviewers.length == 0) {
            message += "There is no top reviewer this week.\n\n"
        } else if (topReviewers.length == 1) {
            message += `This week's **top reviewer** is ||${topReviewers[0].username}||\n\n`
        } else {
            message += "This week's **top reviewers** are ||"
            for (let i in topReviewers) {
                message += `${users[i].username}`

                if (i < topReviewers.length - 2) {
                    message += ", "
                } else if (i == topReviewers.length - 2) {
                    message += ", and "
                }
            }
            message += `\n\n`
        }

        message += `__Now onto section of the week:__\n`
        message += `European: ${sectionStats["European"].ap} (${sectionStats["European"].avg}) :EuropeanCrest:\n`
        message += `Oceanic: ${sectionStats["Oceanic"].ap} (${sectionStats["Oceanic"].avg}) :OceanicCrest:\n`
        message += `American: ${sectionStats["American"].ap} (${sectionStats["American"].avg}) :AmericanCrest:\n\n`

        if (topSections.length == 1) message += "This week's winner is ";
        if (topSections.length > 1) message += "This week's winner are ";

        for (let i in topSections) {
            const section = topSections[i]
            switch (section) {
                case "European":
                    message += `the :${section}Crest: <@&796794784341033041> :${section}Crest:`
                    break;
                case "Oceanic":
                    message += `the :${section}Crest: <@&796794813588439050> :${section}Crest:`
                    break;
                case "American":
                    message += `the :${section}Crest: <@&796794883771465739> :${section}Crest:`
                    break
            }
            if (i < topSections.length - 1) message += " and the ";
        }

        message += "\n```";
        return message
    }

    async applyStrikes() {
        const usersStruck = []

        for (let row in this.rawRows) {
            if (row <= 3) continue
            const columns = this.rawRows[row]

            if (columns[21] == "Incomplete" || columns[21] == "In Progress") {
                const now = new Date();
                const month = now.toLocaleString('en-US', { month: 'long' }).substring(0, 3);
                const day = now.getDate();

                if (columns[3].length != 0) this.rawRows[row][3] += ", ";

                this.rawRows[row][2] = (parseInt(columns[2]) + 1).toString()
                this.rawRows[row][3] += `Q-${month}${day}`

                usersStruck.push({
                    username: columns[0],
                    rank: columns[1],
                    strikes: columns[2],
                    strikelog: columns[3],
                    apps: columns[18],
                    ap: columns[20],
                    status: columns[21],
                    section: columns[23],
                    row: parseInt(row) + 4,
                })
            }
        }
        
        const replacedRowCD = []
        for (let row of this.rawRows) {
            replacedRowCD.push([row[2], row[3]])
        }

        await writeRangeData(this.sheets, this.spreadsheetId, `AP Database!C4:D`, replacedRowCD)
        await writeRangeData(this.sheets, this.spreadsheetId, "Settings!A3:A3", [[addSevenDays(this.CurrentWeek[0][0])]])

        return usersStruck
    }

}

module.exports = CSIDatabase