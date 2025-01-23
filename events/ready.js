const { Events } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

          const { voiceChannelId } = require('./../config.json');
          const { rpGuildId } = require('./../config.json');

          const guild = client.guilds.cache.get(rpGuildId);

          // Set up our connection to our voice chat
          const connection = joinVoiceChannel({
               channelId: voiceChannelId,
               guildId: rpGuildId,
               adapterCreator: guild.voiceAdapterCreator,
          });
     
          connection.on(VoiceConnectionStatus.Ready, () => {
               console.log('The bot has connected to the voice channel!');
          });
	},
};