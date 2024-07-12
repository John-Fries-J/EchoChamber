const fs = require('fs');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { blue } = require('../../colors.json');

const feedbackPointsFile = './feedbackpoints.json';

let feedbackPoints = {};

function loadFeedbackPoints() {
    try {
        feedbackPoints = JSON.parse(fs.readFileSync(feedbackPointsFile, 'utf-8'));
    } catch (error) {
        console.error('Error loading feedback points:', error);
        feedbackPoints = {};
    }
}

loadFeedbackPoints();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givepoints')
        .setDescription('Gives 2 points to the specified user')
        .addUserOption(option => option.setName('user').setDescription('The user to give points to').setRequired(true)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');

        if (!targetUser) {
            return interaction.reply({ content: 'Please specify a user to give points to.', ephemeral: true });
        }

        const userId = targetUser.id;
        if (!feedbackPoints[userId]) {
            feedbackPoints[userId] = 0;
        }

        feedbackPoints[userId] += 2;

        fs.writeFileSync(feedbackPointsFile, JSON.stringify(feedbackPoints, null, 4), 'utf-8');

        const embed = new EmbedBuilder()
            .setTitle('Points Given')
            .setDescription(`Successfully gave 2 points to ${targetUser.username}. They now have ${feedbackPoints[userId]} points.`)
            .setColor(blue)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
