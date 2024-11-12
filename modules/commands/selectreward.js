const discord = require("discord.js");

const choices = [
    {name: "2 Week Quota Exemption (125p)", value: "exempt_2w"},
    {name: "1 Week Quota Exemption (75p)", value: "exempt_1w"},
    {name: "Quota Strike Removal (100p)", value: "strike_removal"},
    {name: "Shoutout in The Taser Tribune (60p)", value: "shoutout"},
    {name: "Host 1 GN in welfare-events (30p)", value: "gamenight"},
    {name: "Ping a sectional role in a sectional channel (40p)", value: "sectional_ping"},
    {name: "Officer greatest medal and role (250p)", value: "oc_greatest_medal_role"},
    {name: "10 MP honor (20p)", value: "10_honor"},
    {name: "20 MP honor (35p)", value: "20_honor"},
    {name: "100 MP honor (150p)", value: "100_honor"},
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
        if (interaction.user.id != "228875454600183808") return interaction.reply({content: "Not Ready", ephemeral: true});

        const choice = interaction.options.getString("reward");
        const name = choices.find(o => o.value == choice).name

        interaction.client.channels.cache.get('861576451773956109').send(`<@&1283556897349173320>, <@${interaction.user.id}> requested '${name}'`);
        interaction.reply({content: "Done", ephemeral: true});;
    }
}