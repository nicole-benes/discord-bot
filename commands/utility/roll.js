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
				.setName( 'roll' )
                    .setRequired( true )
				.setDescription( 'The number of dice to roll (X) and keep (Y).' ) ),
     async execute(interaction) {
          const { X: roll, Y: keep, Q: add, Z: sims , e: emphasis, x: expanded } = parseInput( interaction.options.getString( 'roll' ) );

          if( sims === null ) {
  
              const { keptRolls: keptRolls, unkeptRolls: unkeptRolls, total: total } = rollAndKeep( roll, keep, emphasis, expanded );
  
              let output = 'Rolled **' + roll + '**k**' + keep + '**';
              
            if( add > 0 ) {
                output += '+**' + add + '**';
            }

              output += ':   *Kept Dice*: [ ';
  
              for( let i = 0; i < keptRolls.length; i++ ) {
  
                  output += keptRolls[ i ];
      
                  if( i + 1 < keptRolls.length ) {
                          output += ', ';
                  }
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

              output += '   Total: ***' + ( total + add ) + '*** (*' + total + ' + ' + add + '*)';
  
              await interaction.reply( output );               
  
          } else {
  
            await interaction.deferReply();

            let simulatedTotal = 0;

            for( let i = 0; i < sims; i++ ) {

                const { keptRolls: keptRolls, unkeptRolls: unkeptRolls, total: total } = rollAndKeep( roll, keep, emphasis, expanded );

                simulatedTotal += ( total + add );

            }

            let output = 'Rolled **' + roll + '**k**' + keep + '**';
              
            if( add > 0 ) {
                output += '+**' + add + '**';
            }

            await interaction.editReply( output + ' \u00D7 *' + sims + '*.  Average result: **' + ( simulatedTotal / sims ) + '**' );
        }
    }
};


function parseInput( input ) {
    const regex = /^(\d+)k(\d+)(?:\+(\d+))?(?:\s(\d+))?(?:\s(e))?(?:\s(x))?$/;
    const match = input.match(regex);

    if (match) {
        const X = parseInt(match[1]);
        const Y = parseInt(match[2]);
        const Q = match[3] ? parseInt(match[3]) : null;
        const Z = match[4] ? parseInt(match[4]) : null;
        const e = match[5] ? true : false;
        const x = match[6] ? true : false;

        if (!isNaN(X) && !isNaN(Y) && (Q === null || !isNaN(Q)) && (Z === null || !isNaN(Z))) {
            return { X, Y, Q, Z, e, x };
        } else {
            console.log( 'X, Y, Q, and Z must be numeric.' );
        }
    } else {
        console.log( 'Invalid format. Please use the format "XkY", "XkY+Q", "XkY Z", or "XkY+Q Z"' );
    }
}
  
 
 function rollAndKeep( rolled, keep, emphasis = false, expanded = false ) {
 
     const rolls = [];
 
     for (let i = 0; i < rolled; i++) {    
         rolls.push( rollDie( emphasis, expanded ) );
     }
 
     rolls.sort((a, b) => b - a);
 
     const keptRolls = rolls.slice(0, keep);
     const unkeptRolls = rolls.slice( keep, keep.length );
 
     let total = keptRolls.reduce( ( a, b ) => a + b );
 
     return { keptRolls, unkeptRolls, total };      
 }
 
 
 
function rollDie ( emphasis = false, expanded = false ) {
    let total = roll = getRandomNumber( 1, 10 ); // Roll a d10
 
    let explode = 10;

    if( expanded ) {
        explode = 9;
    }

    if( roll == 1 && emphasis ) {
        roll = getRandomNumber( 1, 10 );
    }

    while (roll >= explode ) {
        roll = getRandomNumber( 1, 10 ); // Roll again
        total += roll; // Add the exploded roll to the total
    }
 
    return total;
}
 
 
 
 function getRandomNumber(min, max) {
     const range = max - min + 1;
     const buffer = crypto.randomBytes(4);
     const randomNumber = buffer.readUInt32LE(0) % range + min;
     return randomNumber;
 }
 