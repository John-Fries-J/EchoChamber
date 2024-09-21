const { Events, EmbedBuilder } = require('discord.js');
const { channelID } = require('../config.json');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		} else if (interaction.isModalSubmit()) {
			if (interaction.customId === 'audioApplication') {
				const embed = new EmbedBuilder()
					.setTitle('Audio Role Application Submission')
					.addFields(
						{ name: 'User', value: interaction.user.tag, inline: true },
						{ name: 'Years of Experience', value: interaction.fields.getTextInputValue('years'), inline: true },
						{ name: 'Signal Flow', value: interaction.fields.getTextInputValue('signal'), inline: false },
						{ name: 'Digital Audio', value: interaction.fields.getTextInputValue('digitalAudio'), inline: false },
						{ name: 'Microphones', value: interaction.fields.getTextInputValue('microphone'), inline: false },
						{ name: 'Compression', value: interaction.fields.getTextInputValue('compression'), inline: false },
						{ name: 'EQ', value: interaction.fields.getTextInputValue('eq'), inline: false },
						{ name: 'Room Acoustics', value: interaction.fields.getTextInputValue('acoustics'), inline: false },
						{ name: 'Phase Issues', value: interaction.fields.getTextInputValue('phaseIssue'), inline: false },
						{ name: 'Mixing vs Mastering', value: interaction.fields.getTextInputValue('mixVsMaster'), inline: false },
						{ name: 'Plugins', value: interaction.fields.getTextInputValue('plugin'), inline: false },
						{ name: 'Patchbay', value: interaction.fields.getTextInputValue('patchbay'), inline: false },
						{ name: 'About You', value: interaction.fields.getTextInputValue('aboutYou'), inline: false },
						{ name: 'Work Link', value: interaction.fields.getTextInputValue('link'), inline: false },
					)
					.setColor('Blue')
					.setTimestamp();

				const targetChannel = interaction.guild.channels.cache.get(channelID);
				if (targetChannel) {
					await targetChannel.send({ embeds: [embed] });
				}

				await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });
			}
		}
	},
};
