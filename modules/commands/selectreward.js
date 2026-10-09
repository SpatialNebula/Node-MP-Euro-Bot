const discord = require("discord.js");

const { allowed_roles } = require("./../config.json");

const choices = [
    {name: "Premier Praesentia medal morph (125p)", value: "premier_praesentia"},
    {name: "100 Robux (200p)", value: "robux"},
    {name: "Quota Strike Removal (100p)", value: "strike_removal"},
    {name: "Custom name (60p)", value: "name"},
    {name: "Custom prefix (40p)", value: "prefix"},
    {name: "Officer's greatest medal and role (250p)", value: "oc_greatest_medal_role"},
    {name: "10 MP honor (20p)", value: "10_honor"},
    {name: "20 MP honor (35p)", value: "20_honor"},
    {name: "100 MP honor (150p)", value: "100_honor"},
    {name: "Permanent officer weekly access (300p)", value: "officer_weekly"}
]

module.exports = {
    data: new discord.SlashCommandBuilder()
        .setName("redeemreward")
        .setDescription("select your reward")
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName("reward")
			    .setDescription('Select your reward')
                .setRequired(true)
                .addChoices(
                    choices
                )
        ),

    /**
    *
    * @param {discord.CommandInteraction} interaction
    */
    execute: async (interaction) => {
        let permitted = false;
        for (role of allowed_roles) {
          if (!interaction.member.roles.cache.has(role)) continue;
          permitted = true;
          break;
        }
        if(!permitted) return(interaction.reply({content: "Not Allowed", ephemeral: true}))

        const choice = interaction.options.getString("reward");
        const name = choices.find(o => o.value == choice).name

        interaction.client.channels.cache.get('1283557589686161449').send(`<@&1283556897349173320>, <@${interaction.user.id}> requested '${name}'`);
        interaction.reply({content: "Done", ephemeral: true});;
    }
}
