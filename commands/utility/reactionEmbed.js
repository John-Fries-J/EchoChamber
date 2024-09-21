const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, PermissionFlagsBits, TextInputStyle } = require('discord.js');
const { blue } = require('../../colors.json');
const { reactionChannel, audioRole, musicRole } = require('../../config.json');

// Function to create a modal with given inputs
function createModal(customId, title, textInputs) {
    const modal = new ModalBuilder()
        .setTitle(title)
        .setCustomId(customId);

    const actionRows = [];
    for (let i = 0; i < textInputs.length; i += 5) {
        actionRows.push(new ActionRowBuilder().addComponents(...textInputs.slice(i, i + 5)));
    }

    modal.addComponents(...actionRows);
    return modal;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionembed')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDescription('Send reaction embed to specified channel in the config.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setDescription(`**APPLY TO THE ROLE THAT SUITS WHAT YOU DO THE BEST**\nThese roles will require you to pass an assessment which will be reviewed and evaluated. Please give some time for the application to be reviewed as we take all submissions seriously and cannot approve roles immediately.\n\n<@&${audioRole}> - Apply Now with the 🎚️ button!\n\n<@&${musicRole}> - Apply Now with the 🎹 button!`)
            .setColor(blue);
        const channel = interaction.guild.channels.cache.get(reactionChannel);
        const reactionMessage = await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `Reaction embed sent to <#${reactionChannel}>`, ephemeral: true });

        const audioButton = new ButtonBuilder()
            .setLabel('🎚️')
            .setCustomId('audioRole')
            .setStyle('Primary');

        const musicButton = new ButtonBuilder()
            .setLabel('🎹')
            .setCustomId('musicRole')
            .setStyle('Primary');

        reactionMessage.edit({ components: [new ActionRowBuilder().addComponents(audioButton, musicButton)] });

        const filter = i => i.customId === 'audioRole' || i.customId === 'musicRole';
        const collector = reactionMessage.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            if (i.customId === 'audioRole') {
                const textInputs1 = [
                    new TextInputBuilder().setCustomId('years').setLabel('Years of Experience').setStyle(TextInputStyle.Short),
                    new TextInputBuilder().setCustomId('signal').setLabel('Explain signal flow in an audio system').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('digitalAudio').setLabel('Difference between sample rate and bit depth').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('microphone').setLabel('Difference between dynamic and condenser mics').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('compression').setLabel('Main parameters of a compressor').setStyle(TextInputStyle.Paragraph)
                ];

                const textInputs2 = [
                    new TextInputBuilder().setCustomId('eq').setLabel('How to use EQ for a muddy vocal track').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('acoustics').setLabel('Importance of room acoustics in audio work').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('phaseIssue').setLabel('What are phase issues in audio work').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('mixVsMaster').setLabel('Difference between mixing and mastering').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('plugin').setLabel('3 recent go-to plugins for audio processing').setStyle(TextInputStyle.Paragraph)
                ];

                const textInputs3 = [
                    new TextInputBuilder().setCustomId('patchbay').setLabel('Main function of a patchbay in studio').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('aboutYou').setLabel('Tell us your experience as an audio engineer').setStyle(TextInputStyle.Paragraph),
                    new TextInputBuilder().setCustomId('link').setLabel('Link some work that you are proud of').setStyle(TextInputStyle.Paragraph)
                ];

                const modal1 = createModal('audioApplication1', 'Audio Role Application (1/3)', textInputs1);
                const modal2 = createModal('audioApplication2', 'Audio Role Application (2/3)', textInputs2);
                const modal3 = createModal('audioApplication3', 'Audio Role Application (3/3)', textInputs3);

                await i.showModal(modal1);

                const modalFilter = interaction => interaction.customId.startsWith('audioApplication');
                const modalCollector = reactionMessage.createMessageComponentCollector({ modalFilter, time: 60000 });

                modalCollector.on('collect', async interaction => {
                    if (interaction.customId === 'audioApplication1') {
                        await interaction.showModal(modal2);
                    } else if (interaction.customId === 'audioApplication2') {
                        await interaction.showModal(modal3);
                    } else if (interaction.customId === 'audioApplication3') {
                        await interaction.reply({ content: 'Thank you for completing the application!', ephemeral: true });
                    }
                });
            } else if (i.customId === 'musicRole') {
                await i.member.send({ content: 'You have applied for the Music Role!', components: [] });
                await i.deferUpdate();
            }
        });
    }
};
