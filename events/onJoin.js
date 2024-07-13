const fs = require('fs');
const { Events, EmbedBuilder } = require('discord.js');
const { green } = require('../colors.json');
const config = require('../config.json');
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
loadFeedbackPoints()

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const channelId = `${config.logChannel}`;
        const channel = member.guild.channels.cache.get(channelId);
        
        if (!channel) {
            console.log('Log channel not found');
            return;
        }
        const logEmbed = new EmbedBuilder()
        .setTitle(`User Joined`)
        .setDescription(`${member.user.tag} joined the server.`)
        .setColor(green)
        .setTimestamp();
    channel.send({ embeds: [logEmbed] });


        const userId = member.id;
        if (!feedbackPoints[userId]) {
            feedbackPoints[userId] = 2;
        }

        fs.writeFileSync(feedbackPointsFile, JSON.stringify(feedbackPoints, null, 4), 'utf-8');

    },
};