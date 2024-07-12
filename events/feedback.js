const fs = require('fs');
const { Events, EmbedBuilder } = require('discord.js');
const { feedbackID, feedbackReq } = require('../config.json');
const { blue } = require('../colors.json');

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

let threadUsers = {};

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;

        const feedbackChannel = message.guild.channels.cache.get(feedbackID);
        if (!feedbackChannel) return;

        if (message.channel.id === feedbackChannel.id) {
            try {
                const createdThread = await message.startThread({
                    name: `Feedback from ${message.author.tag}`,
                    autoArchiveDuration: 60,
                });
                const embed = new EmbedBuilder()
                    .setDescription(`Reminder, each feedback you submit gives you one point towards submitting your own feedback. You must have ${feedbackReq} points to submit your own feedback.`)
                    .setColor(blue);

                await createdThread.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error handling feedback:', error);
            }
        } else if (message.channel.isThread() && message.channel.parentId === feedbackID) {
            const userId = message.author.id;
            const threadId = message.channel.id;

            if (!threadUsers[threadId]) {
                threadUsers[threadId] = new Set();
            }

            if (!threadUsers[threadId].has(userId)) {
                threadUsers[threadId].add(userId);

                if (!feedbackPoints[userId]) {
                    feedbackPoints[userId] = 0;
                }

                const noPoints = feedbackPoints[userId] === 0;

                feedbackPoints[userId]++;
                
                fs.writeFileSync(feedbackPointsFile, JSON.stringify(feedbackPoints, null, 4), 'utf-8');

                if (noPoints) {
                    try {
                        const embed = new EmbedBuilder()
                        .setTitle(`Congratulations you have given your first piece of feedback! 🎉`)
                        .setDescription(`On ${message.guild.name} we have a points system. In order to receive feedback on your projects, you must have ${feedbackReq} points. Currently you have ${feedbackPoints[userId]} point.`)
                        .setColor(blue);
                        await message.author.send({ embeds: [embed] });
                    } catch (error) {
                        console.error('Error sending DM to user:', error);
                    }
                }
                return;
            }
        }
    }
};
