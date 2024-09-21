const fs = require('fs');
const { Events, EmbedBuilder } = require('discord.js');
const { feedbackID, feedbackReq, whitelistLinks } = require('../config.json');
const { blue } = require('../colors.json');

const feedbackPointsFile = './feedbackpoints.json';

let feedbackPoints = {};
let threadUsers = {};

function loadFeedbackPoints() {
    try {
        feedbackPoints = JSON.parse(fs.readFileSync(feedbackPointsFile, 'utf-8'));
    } catch (error) {
        console.error('Error loading feedback points:', error);
        feedbackPoints = {};
    }
}

loadFeedbackPoints();

function isLinkAllowed(link) {
    for (const allowedLink of whitelistLinks) {
        if (link.startsWith(allowedLink)) {
            return true;
        }
    }
    return false;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;

        const feedbackChannel = message.guild.channels.cache.get(feedbackID);
        if (!feedbackChannel) return;

        if (message.channel.id === feedbackChannel.id) {
            const content = message.content.toLowerCase();
            const words = content.split(' ');
            const links = words.filter(word => word.startsWith('http://') || word.startsWith('https://'));
            const hasAttachments = message.attachments.size > 0;
            
            if (links.length === 0 && !hasAttachments) {
                try {
                    const embed = new EmbedBuilder()
                        .setTitle('Feedback Requirement')
                        .setDescription('Your feedback message must contain either a link or an attachment.')
                        .setColor(blue);
                    await message.author.send({ embeds: [embed] });
                } catch (error) {
                    console.error('Error sending DM to user about missing link/attachment:', error);
                }
                await message.delete();
                return;
            }

            if (links.length > 0) {
                let allowed = true;
                for (const link of links) {
                    if (!isLinkAllowed(link)) {
                        allowed = false;
                        break;
                    }
                }
                if (!allowed) {
                    try {
                        const embed = new EmbedBuilder()
                            .setTitle('Invalid Link Detected')
                            .setDescription(`Sorry, but the link(s) you provided are not allowed in this server. Please refer to the allowed websites for submitting feedback.`)
                            .setColor(blue);
                        await message.author.send({ embeds: [embed] });
                    } catch (error) {
                        console.error('Error sending DM to user about invalid link:', error);
                    }
                    await message.delete();
                    return;
                }
            }

            const userId = message.author.id;

            if (!feedbackPoints[userId]) {
                feedbackPoints[userId] = 0;
            }

            if (feedbackPoints[userId] < 2) {
                try {
                    console.log('okay')
                    // const embed = new EmbedBuilder()
                    //     .setTitle('Insufficient Feedback Points')
                    //     .setDescription(`Sorry, but you need at least ${feedbackReq} points to submit your own feedback.`)
                    //     .setColor(blue);
                    // await message.author.send({ embeds: [embed] });
                } catch (error) {
                    console.error('Error sending DM to user about insufficient points:', error);
                }
            }

            fs.writeFileSync(feedbackPointsFile, JSON.stringify(feedbackPoints, null, 4), 'utf-8');

            try {
                const createdThread = await message.startThread({
                    name: `Give feedback to ${message.author.tag}`,
                    autoArchiveDuration: null,
                });

                const embed = new EmbedBuilder()
                    .setDescription(`Reminder, each feedback you submit gives you one point towards submitting your own feedback. You must have ${feedbackReq} points to submit your own feedback.`)
                    .setColor(blue);
                await createdThread.send({ embeds: [embed] });
                // feedbackPoints[userId] -= 2;
            } catch (error) {
                console.error('Error handling feedback:', error);
            }
        } else if (message.channel.isThread() && message.channel.parentId === feedbackID) {
            const userId = message.author.id;
            const threadId = message.channel.id;

            let threadOwner;
            try {
                threadOwner = await message.channel.fetchOwner();
            } catch (error) {
                console.error('Error fetching thread owner:', error);
                return;
            }
            if (message.author.id !== threadOwner.id) {
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
                }
            }
        }
    }
};
