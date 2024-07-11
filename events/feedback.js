const { Events } = require('discord.js');
const { feedbackID } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;
        const feedbackChannel = message.guild.channels.cache.get(feedbackID);
        if (!feedbackChannel) return;
        if (message.channel.id !== feedbackChannel.id) return;

        try {
            await message.startThread({
                name: `Feedback from ${message.author.username}`,
                autoArchiveDuration: null, 
            });
        } catch (error) {
            console.error('Error creating thread:', error);
        }
    }
}
