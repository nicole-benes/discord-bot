const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const fs = require('fs');


module.exports = {
     cooldown: 5,
     category: 'utility',
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('For testing purposes only'),
	async execute(interaction) {
          // Join the voice channel
          const connection = joinVoiceChannel({
               channelId: interaction.member.voice.channel.id,
               guildId: interaction.guild.id,
               adapterCreator: interaction.guild.voiceAdapterCreator,
          });

          // Log the state changes of the connection
          connection.on('stateChange', (oldState, newState) => {
               console.log(`Voice connection state changed: ${oldState.status} -> ${newState.status}`);
          });

          // Handle the connection being ready
          connection.on(VoiceConnectionStatus.Ready, () => {
               console.log('The bot has connected to the voice channel!');

               // Create the audio player and resource
               const player = createAudioPlayer();
  
               const filePath = '/home/nmbenes/audio/berlin.mp3';

               const resource = createAudioResource( filePath, {
                    metadata: {
                         title: 'Audio',
                    },
               });

               // Play the audio resource
               player.play(resource);
               connection.subscribe(player);

               // Handle when the audio finishes
               player.on(AudioPlayerStatus.Idle, () => {
                    connection.destroy();
                    console.log('Audio finished playing, disconnected from the voice channel');
               });

               player.on('error', (error) => {
                    console.error(error);
                    connection.destroy();
               });

               interaction.reply(`Now playing: ${filePath}`);
          });

          // Handle connection errors or disconnections
          connection.on('error', (error) => {
               console.error('Voice connection error: ', error);
               connection.destroy();
          });
	},
};