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

          let hand = [];
          let deck = new standardDeck();

          // We're always going to draw two cards to start at least 
          hand.push( deck.draw() );
          hand.push( deck.draw() );

/*
          // This is the ratio of the pngs
          const ratio =  0.68870523;

          // Set up our canvas size
          const height = 300;
          const width = height * ratio;
          const offset = 5;
          
          // Create the actual canvas with room for padding between the cards
          const canvas = Canvas.createCanvas( ( 6 * width ) + ( 8 * offset ), ( height * 2 ) + ( 8 * offset ) );
		const context = canvas.getContext( '2d' );

          // Loop through each of the cards currently in the hand
          for( let i = 0; i < hand.length; i++ ) {

               // Get the filename for this card
               const cardImage = await Canvas.loadImage( './cards-png/' + deck.getFilename( hand[ i] ) );

               // We need to know which column we working with
               let columnCount = i;

               // Assume we're working on the first row
               let y1 = offset;
               let y2 = offset + height;

               // If we're on card 6 and up, we need another row
               if( columnCount > 5 ) {

                    // Start over at column 0
                    columnCount = i - 6;

                    // Update y values
                    y1 = ( offset * 3 ) + height;
                    y2 = ( offset * 3 ) + height;
               }

               // Figure out the top left corner of this card
               let x1 = ( columnCount + 1 ) * offset + ( columnCount * width );

               // Add the current card to our image in the right place
               context.drawImage( cardImage, x1, y1, width, y2 );
          }

*/
          // Render the finalized image of our current hand
          let renderedCards = new AttachmentBuilder( await canvas.encode( 'png' ), { name: 'cards.png' } );
          
          const response = await interaction.reply({
			content: 'Cards Drawn: **' + hand.length + '**' + '. Do you want to draw another card?',
               files: [ renderedCards ],
			components: [ row ],
          });

     
          const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });
          
          collector.on('collect', async i => {
               const selection = i.customId;
               if( selection == 'deal' ) {
                    hand.push( deck.draw() );

                    await i.update({
                         content: 'Cards Drawn: **' + hand.length + '**' + '. Do you want to draw another card?',
                         files: [ renderedCards ],
                         components: [ row ],
                    })

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

                    await i.update({ 
                         content: 'Cards Dawn: **' + hand.length + '**',
                         files: [ renderedCards ],
                         components: [ disabledRow ],
                    });
               }
          });          
     }
};

class pokerHand {
     constructor() {
          this.deck = new standardDeck();
     }

     renderHand() {
          // This is the ratio of the pngs
          const ratio =  0.68870523;

          // Set up our canvas size
          const height = 300;
          const width = height * ratio;
          const offset = 5;
          
          // Create the actual canvas with room for padding between the cards
          const canvas = Canvas.createCanvas( ( 6 * width ) + ( 8 * offset ), ( height * 2 ) + ( 8 * offset ) );
          const context = canvas.getContext( '2d' );

          // Loop through each of the cards currently in the hand
          for( let i = 0; i < hand.length; i++ ) {

               // Get the filename for this card
               const cardImage = await Canvas.loadImage( './cards-png/' + deck.getFilename( hand[ i] ) );

               // We need to know which column we working with
               let columnCount = i;

               // Assume we're working on the first row
               let y1 = offset;
               let y2 = offset + height;

               // If we're on card 6 and up, we need another row
               if( columnCount > 5 ) {

                    // Start over at column 0
                    columnCount = i - 6;

                    // Update y values
                    y1 = ( offset * 3 ) + height;
                    y2 = ( offset * 3 ) + height;
               }

               // Figure out the top left corner of this card
               let x1 = ( columnCount + 1 ) * offset + ( columnCount * width );

               // Add the current card to our image in the right place
               context.drawImage( cardImage, x1, y1, width, y2 );
          }

          return canvas.encode( 'png' );
     }
}

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

     drawCard() {
          if( this.deck.length > 0 ) {
               const draw = this.getRandomNumber( 0 * this.deck.length );

               return this.deck.splice( draw, 1 )[ 0 ];
          }

          return false;
     }

     getFilename( card ) {
          return '3_of_clubs.png';
     }
     
     getRandomNumber( min, max ) {
          const range = max - min + 1;
          const buffer = crypto.randomBytes(4);
          const randomNumber = buffer.readUInt32LE(0) % range + min;
          return randomNumber;
      }
}
