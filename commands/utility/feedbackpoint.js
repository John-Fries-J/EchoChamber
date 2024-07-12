const fs = require('fs');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { feedbackReq } = require('../../config.json');
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
		.setName('feedback')
		.setDescription('Replies with the user\'s points'),
	async execute(interaction) {
        const userId = interaction.user.id;
        const userPoints = feedbackPoints[userId] || 0;

		const embed = new EmbedBuilder()
			.setTitle('Points')
			.setDescription(`You currently have ${userPoints}/${feedbackReq} points`)
			.setColor(blue)
			.setTimestamp();
		await interaction.reply({ embeds: [embed], epithermal: true});
	},
};
