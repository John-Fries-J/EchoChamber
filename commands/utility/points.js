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
        .setName('points')
        .setDescription('Gets points of specified user')
        .addUserOption(option => option.setName('user').setDescription('The user to view the points of')),
    async execute(interaction) {
        let userId;

        const targetUser = interaction.options.getUser('user');
        if (!targetUser) {
            userId = interaction.user.id; // If no user is specified, fetch points for the user who invoked the command
        } else {
            userId = targetUser.id; // If a user is specified, fetch points for the specified user
        }

        if (!feedbackPoints[userId]) {
            feedbackPoints[userId] = 0;
        }

        const embed = new EmbedBuilder()
            .setTitle('Points')
            .setDescription(`${targetUser ? targetUser.username : interaction.user.username} currently has ${feedbackPoints[userId]} points`)
            .setColor(blue)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
