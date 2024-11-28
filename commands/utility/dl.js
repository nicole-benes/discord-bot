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
          const { number: roll, type: type, add: add, sims: sims } = parseInput( interaction.options.getString( 'options' ) );

          if( sims === null ) {
  
              const { result: bestRoll, unkeptRolls: unkeptRoll, botched: botch } = rollDice( roll, type );
  
              let output = 'Rolled **' + roll + '**d**' + type + '**';
              
            if( add > 0 ) {
                output += '+**' + add + '**';
            }

            if( botched ) {
               output += '\u2192   *You botched:';

               output += '[ ';

               for( let i = 0; i < unkeptRolls.length; i++ ) {
                    output += unkeptRolls[ i ];
                    
                    if( i + 1 < unkeptRolls.length ) {
                         output += ', ';
                     }                    
               }

               output += ' ]';
            } else {
               output += '   \u2192   *Best Result*: [ ' + keptRolls + ' ]';
            
               if( unkeptRolls.length > 0 ) {
                   output += ' *Other Results*: [ ';
         
                   for( let i = 0; i < unkeptRolls.length; i++ ) {
         
                       output += unkeptRolls[ i ];
         
                       if( i + 1 < unkeptRolls.length ) {
                           output += ', ';
                       }
                   }          
         
                   output += ' ]';
         
               }
   
               output += '   \u2192   Best: ***' + ( result + add ) + '***';
               
               if( add > 0 ) {
                   output += ' (*' + result + ' + ' + add + '*)';
               }
   
            }

            await interaction.reply( output );               
  
          } else {
/*  
            await interaction.deferReply();

            let simulatedTotal = 0;
            let rolls = [];

            for( let i = 0; i < sims; i++ ) {

                const { keptRolls: keptRolls, unkeptRolls: unkeptRolls, total: total } = rollAndKeep( roll, keep, emphasis, expanded );

                simulatedTotal += ( total + add );

                rolls.push( total + add );

            }

            let output = 'Rolled **' + roll + '**k**' + keep + '**';
            
            if( add > 0 ) {
                output += '+**' + add + '**';
            }

            if( emphasis ) {
                output += ' [Emphasis]';
            }

            if( expanded ) {
                output += ' [Exploding on 9 & 10]';
            }

            await interaction.editReply( output + ' \u00D7 *' + sims + '*   \u2192   Mean: **' + ( simulatedTotal / sims ) + '**  Median: **' + calculateMedian( rolls ) + '**  SD: **' + calculateStandardDeviation( rolls ) + '**' );
*/
         }
    }
};


function parseInput( input ) {
    const regex = /^(\d+)d(\d+)(?:\+(\d+))?(?:\s(\d+))?(?:\s(e))?(?:\s(x))?$/;
    const match = input.match(regex);

    if (match) {
        const number = parseInt(match[1]);
        const type = parseInt(match[2]);
        const add = match[3] ? parseInt(match[3]) : null;
        const sims = match[4] ? parseInt(match[4]) : null;

        if (!isNaN( number ) && !isNaN( type ) && ( add === null || !isNaN( add )) && ( sims === null || !isNaN( sims ))) {
            return { number, type, add, sims };
        } else {
            console.log( 'X, Y, Q, and Z must be numeric.' );
        }
    } else {
        console.log( 'Invalid format. Please use the format "*[number]*d*[type]*", "*[number]*d*[type]*+*[addition]*", "*[number]*d*[type]* *[Number of Simulations]*", or "*[number]*d*[type]*+*[addition]* *[Number of Simulations]"' );
    }
}
  
 
 function rollDice( rolled, type ) {
 
     const rolls = [];
 
     for (let i = 0; i < rolled; i++) {    
         rolls.push( rollDie( type ) );
     }
 
     rolls.sort((a, b) => b - a);
 
     const keptRolls = rolls.slice( 0, 1 );
     const unkeptRolls = rolls.slice( 1, keep.length );
 
     let botch = false;

     return { keptRolls, unkeptRolls, botch };      
 }
 
 
 
function rollDie( type ) {
    let total = roll = getRandomNumber( 1, type ); // Roll a d-whatever
 
    let explode = type;

    while ( roll  >= explode ) {
        roll = getRandomNumber( 1, type ); // Roll again
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
 


 function calculateMedian(numbers) {
    const sortedNumbers = numbers.slice().sort((a, b) => a - b);
    const length = sortedNumbers.length;
  
    if (length % 2 === 0) {
      const mid = length / 2;
      return (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2;
    } else {
      const mid = Math.floor(length / 2);
      return sortedNumbers[mid];
    }
  }



  function calculateStandardDeviation(numbers) {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDifferencesSum = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0);
    const variance = squaredDifferencesSum / numbers.length;
    const standardDeviation = Math.sqrt(variance);
    return standardDeviation;
  }