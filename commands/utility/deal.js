const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ComponentType } = require('discord.js');
const crypto = require('crypto');
const Canvas = require('@napi-rs/canvas');

module.exports = {
     cooldown: 5,
     category: 'utility',
     data: new SlashCommandBuilder()
		.setName( 'deal' )
		.setDescription( 'Deal some cards from a fresh deck.' ),
     async execute( interaction ) {

          const deal = new ButtonBuilder()
			.setCustomId( 'deal' )
			.setLabel( 'Deal a Card' )
			.setStyle( ButtonStyle.Success);

          const cancel = new ButtonBuilder()
			.setCustomId( 'cancel' )
			.setLabel( 'Quit' )
			.setStyle( ButtonStyle.Danger );

          const row = new ActionRowBuilder()
			.addComponents( deal, cancel );               

          const response = await interaction.reply({
			content: `Do you want to draw a card?`,
			components: [ row ],
          });

          const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });

          let hand = [];
          let deck = new standardDeck();


//          const ratio =  0.63166847;
          const ratio =  0.68870523;

          const height = 300;
          const width = height * ratio;
          const offset = 5;
          
          const canvas = Canvas.createCanvas( ( 6 * width ) + ( 8 * offset ), ( height * 2 ) + ( 8 * offset ) );
		const context = canvas.getContext( '2d' );

          const cardOne = await Canvas.loadImage( './cards-png/king_of_hearts2.png' );
          const cardTwo = await Canvas.loadImage( './cards-png/3_of_clubs.png' );

          // Loop through each of the cards currently in the hand
          for( let i = 0; i < hand.length; i++ ) {

          }

/*
//          const background = await Canvas.loadImage( './cards-png/king_of_hearts2.png' );
          context.drawImage(cardOne, offset, offset, width, height + offset);
          context.drawImage(cardTwo, width + offset, offset, width, height + offset  );
          context.drawImage(cardOne, ( 2 * width ) + ( 2 * offset ), offset, width, height + offset );
*/

          for( let i = 0; i < 12; i++ ) {

               let rowCount = i;
               let y1 = offset;
               let y2 = offset + height;

               if( rowCount > 5 ) {
                    rowCount = i - 6;
                    y1 = ( offset * 3 ) + height;
                    y2 = ( offset * 3 ) + height;
               }

               let x1 = ( rowCount + 1 ) * offset + ( rowCount * width );

               context.drawImage(cardOne, x1, y1, width, y2 );

/*
               let topLeftX = ( ( i + 1 ) * offset ) + ( i * width );

               let topLeftY = offset;

               if( i > 5 ) {
                    topLeftY = ( offset * 2 ) + height;

               }
//               let bottomRightX = ( ( i + 1 ) * offset ) + ( ( i + 1 ) * width );
//               let bottomRightY = height;

//               console.log( topLeftX + ',' + topLeftY + ' -> ' + bottomRightX + ',' + bottomRightY );

               context.drawImage(cardOne, topLeftX, topLeftY, width, ( offset + height ) );
*/
          }

          const attachment = new AttachmentBuilder(await canvas.encode( 'png' ), { name: 'card.png' });

          let files = [];
          
          collector.on('collect', async i => {
               const selection = i.customId;

               if( selection == 'deal' ) {
                    presses += 1;
                    hand.push( deck.draw() );
                    files.push( attachment );
                    
                    for( let i = 0; i < hand.length; i++ ) {
                         switch( hand[ i ].suit ) {
                              case 'h':
                                   break;
                              case 'd':
                                   break;
                              case 's':
                                   break;
                              case 'c':
                                   break;
                              default:
                                   break;
                         }
                    }
                    await i.update({
                         files: [ attachment ],

                    })
/*
                    await i.update({
                         content: '# ' + renderedHand,
//                         content: 'Hand (' + presses + '): ' + renderedHand,
                         components: [row],
                    });
*/
               } else {
                    const disabledDeal = new ButtonBuilder()
                         .setCustomId( 'disabledDeal' )
                         .setLabel( 'Deal a Card' )
                         .setStyle( ButtonStyle.Success)
                         .setDisabled(true);
     
                    const disabledCancel = new ButtonBuilder()
                         .setCustomId( 'disabledCancel' )
                         .setLabel( 'Quit' )
                         .setStyle( ButtonStyle.Danger )
                         .setDisabled(true);

                    const disabledRow = new ActionRowBuilder()
                         .addComponents( disabledDeal, disabledCancel );

                    await i.update({ content: 'Cards Dawn: **' + presses + '**', components: [ disabledRow ] });
               }
          });          
     }
};

class standardDeck {
     constructor() {
          const suits = [ "h", "d", "c", "s" ];
          const ranks = [ 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A" ];
          
          this.deck = [];
     
          for( var i = 0; i < suits.length; i++ ) {
               for( var j = 0; j < ranks.length; j++ ) {
                    var card = {};
                    card.suit = suits[ i ];
                    card.rank = ranks[ j ];
     
                    this.deck.push(card);
               }
          }
          
          this.deck.push( { suit: 'joker', rank: 'red' } );
          this.deck.push( { suit: 'joker', rank: 'black' } );
     }

     draw() {
          if( this.deck.length > 0 ) {
               const draw = this.getRandomNumber( 0 * this.deck.length );

               return this.deck.splice( draw, 1 )[ 0 ];
          }

          return false;
     }
     
     getRandomNumber(min, max) {
          const range = max - min + 1;
          const buffer = crypto.randomBytes(4);
          const randomNumber = buffer.readUInt32LE(0) % range + min;
          return randomNumber;
      }
}
