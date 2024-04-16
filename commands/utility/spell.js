const { SlashCommandBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
     cooldown: 5,
     category: 'utility',
     data: new SlashCommandBuilder()
		.setName('spell')
		.setDescription('Look up a spell by exact name.')
		.addStringOption(option =>
			option
				.setName('name')
				.setDescription('The name of the spell.')),
     async execute(interaction) {
          const searchName = interaction.options.getString('name');

          console.log( interaction.user.username + ' attempted to look up: ' + searchName );

          let matched = false;
          let output = '';

          await interaction.deferReply();

          fetch('https://www.kanawa-mura.com/api/spells?terms=' + searchName )
               .then(response => {
                    if (!response.ok) {
                         console.log( ' \u2BA1 Error: ' + response );
                         //throw new Error('Network response was not ok');
                    }
                    return response.json();
          })
          .then(data => {

               console.log( ' \u2BA1 Response from Kanawa-Mura recieved' );

               if( data.length > 0 ) {

                    for ( const key in data ) {
                         if( data[ key ].title.toLowerCase() == searchName.toLowerCase() ) {

                              matched = true;

                              output = '### ' + data[ key ].title ;

                              if( 'source' in data[ key ] && data[ key ].source.length > 0 ) {
                                   output += ' [' + data[ key ].source + ']';
                              }

                              output += '\n* **Ring/Mastery**: ' + data[ key ].trait + ' ' + data[ key ].rank;

                              if( data[ key ].field_keywords.length > 0 ) {
                                   output += ' [' + data[ key ].field_keywords + ']';
                              }                              

                              output += '\n';

                              if( 'field_range' in data[ key ] ) {

                                   const regex = /&[a-z]+;/g;
                                   const range = data[ key ].field_range.replace(regex, function(match) {
                                        return String.fromCharCode(parseInt(match.substring(1, match.length - 1), 10));
                                   });

                                   output += '* **Range**: ' + decodeHTMLEntities( data[ key ].field_range ) + '\n';

                                   
                              }

                              if( 'field_area_of_effect' in data[ key ] ) {
                                   output += '* **Area of Effect**: ' + decodeHTMLEntities( data[ key ].field_area_of_effect ) + '\n';
                              }

                              if( 'field_duration' in data[ key ] ) {
                                   output += '* **Duration**: ' + data[ key ].field_duration + '\n';
                              }

                              if( 'field_raises' in data[ key ] ) {
                                   output += '* **Raises**: ' + decodeHTMLEntities( data[ key ].field_raises ) + '\n';
                              }

                              if( 'field_spell_special' in data[ key ] && data[ key ].length > 0 ) {
                                   output += '* **Special**: ' + data[ key ].field_spell_special + '\n';
                              }

                              output +=  data[ key ].body + '\n';
                         }
                       }
               }

               if( matched ) {
                    interaction.editReply( output );

                    console.log( ' \u2BA1 match found' );

               } else {
                    
                    console.log( ' \u2BA1 No match found' );

                    output = '### No spell found, did you mean one of these:\n';
                    let spells = '';

                    for ( const key in data ) {
                         spells += decodeHTMLEntities( data[ key ].title ) + ' [' + data[ key ].trait + ' ' + data[ key ].rank + ']\n';                      
                    }

                    if( spells.length > 0 ) {
                         output += spells;
                    } else {
                         output = '### No spell found and no suggestions found.\n';
                    }

                    interaction.editReply( output );
               }   
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
          });
     },                    
};

function decodeHtml(html) {
     var txt = document.createElement("textarea");
     txt.innerHTML = html;
     return txt.value;
 }

 function decodeHTMLEntities(rawStr) {
     return rawStr.replace(/&#(\d+);/g, ((match, dec) => `${String.fromCharCode(dec)}`));
   }