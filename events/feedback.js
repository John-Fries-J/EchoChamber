const { Events, EmbedBuilder } = require('discord.js');
const { feedbackID, feedbackReq } = require('../config.json');
const { blue } = require('../colors.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;
        const feedbackChannel = message.guild.channels.cache.get(feedbackID);
        if (!feedbackChannel) return;
        if (message.channel.id !== feedbackChannel.id) return;
            const createdThread = await message.startThread({
                name: `Feedback from ${message.author.tag}`,
                autoArchiveDuration: null,
            });
            const embed = new EmbedBuilder()
            .setTitle(`Feedback from ${message.author.tag}`)
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription(`Reminder, each feedback you submit gives you one point towards submitting your own feedback. You must have ${feedbackReq} points to submit your own feedback.`)
            .setColor(blue);
            await createdThread.send({ embeds: [embed]});

    }
}
