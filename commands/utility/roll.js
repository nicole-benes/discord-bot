const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
     cooldown: 5,
     category: 'utility',
     data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll a number of exploding D10s, and keep some of them.')
		.addStringOption(option =>
			option
				.setName('roll')
				.setDescription('The number of dice to roll (X) and keep (Y).')),
     async execute(interaction) {
          const operation = interaction.options.getString('roll');

          const regex = /^(\d+)k(\d+)$/;
          const match = operation.match(regex);

          const [, rolled, keep ] = match.map(Number);

          const rolls = [];

          let total = 0;
        
          // Roll X d10s
          for (let i = 0; i < rolled; i++) {

               let total = roll = getRandomNumber( 1, 10 ); // Roll a d10

               // Explode on a 10
               while (roll === 10) {
                    roll = getRandomNumber( 1, 10 ); // Roll again
                    total += roll; // Add the exploded roll to the total
               }

               rolls.push(total);
          }
        
          // Sort the rolls in descending order
          rolls.sort((a, b) => b - a);          
 
          total = 0;

          // Keep the highest Y dice
          const keptRolls = rolls.slice(0, keep);
          const unkeptRolls = rolls.slice( keep, keep.length );

          let output = 'Rolled **' + rolled + '**k**' + keep + '**:   *Kept Dice*: [ ';

          for( let i = 0; i < keptRolls.length; i++ ) {

               output += keptRolls[ i ];

               if( i + 1 < keptRolls.length ) {
                    output += ', ';
               }

               total += keptRolls[ i ];
          }          

          output += ' ]';
          
          if( unkeptRolls.length > 0 ) {
               output += ' *Unkept Dice*: [ ';

               for( let i = 0; i < unkeptRolls.length; i++ ) {

                    output += unkeptRolls[ i ];

                    if( i + 1 < unkeptRolls.length ) {
                         output += ', ';
                    }
               }          

               output += ' ]';

          }

          output += '   Total: ***' + total + '***';

          await interaction.reply( output );

//          await interaction.reply( 'Rolled ' + rolled + 'k' + keep + ' [**' + keptRolls + '** ' + unkeptRolls + '] **Total**: ' + total );
     },                    
};


function getRandomNumber(min, max) {
     const range = max - min + 1;
     const buffer = crypto.randomBytes(4);
     const randomNumber = buffer.readUInt32LE(0) % range + min;
     return randomNumber;
   }