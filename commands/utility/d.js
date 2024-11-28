const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
     cooldown: 5,
     category: 'utility',
     data: new SlashCommandBuilder()
		.setName('dl')
		.setDescription('Roll a number of exploding dice and keep the best.')
		.addStringOption(option =>
			option
				.setName( 'options' )
                    .setRequired( true )
				.setDescription( 'TBD' ) ),
     async execute(interaction) {
  
          // interaction.options.getString( 'd' )
          await interaction.reply( 'ddsad' );   
     }
}