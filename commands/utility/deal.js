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

          let hand = new pokerHand();

          // We're always going to draw two cards to start at least 
          hand.draw();
          hand.draw();

          // Render the finalized image of our current hand
          let renderedCards = new AttachmentBuilder( await hand.renderHand(), { name: 'cards.png' } );
          
          const response = await interaction.reply({
			content: 'Cards Drawn: **' + hand.length() + '**' + '. Do you want to draw another card? ',
               files: [ renderedCards ],
			components: [ row ],
          });

     
          const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });
          
          collector.on('collect', async i => {
               const selection = i.customId;
               if( selection == 'deal' ) {
                    hand.draw();

                    renderedCards = new AttachmentBuilder( await hand.renderHand(), { name: 'cards.png' } );

                    await i.update({
                         content: 'Cards Drawn: **' + hand.length() + '**' + '. Do you want to draw another card?',
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
                         content: 'Cards Dawn: **' + hand.length() + '**',
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
          this.hand = [];
     }

     draw() {
          this.hand.push( this.deck.drawCard() );
     }

     length() {
          return this.hand.length;
     }

     async renderHand() {
          // This is the ratio of the pngs
          const ratio =  0.68870523;

          // Set up our canvas size
          const height = 200;

          // Calculate the width of the cards
          const width = parseInt( height * ratio );

          // The space between the cards
          const offset = 10;

          // How many cards to display horizontally
          const maxColumns = 8;

          // Figure out how wide the canvas shoud be
          const canvasWidth = ( maxColumns * offset ) + ( maxColumns * width ) + offset;
     
          // We start on row 0
          let rows = parseInt( this.hand.length / maxColumns ) + 1;          
          
          // The 8th card messes up the rows calculation
          if( this.hand.length % 8 == 0 ) {
               rows -= 1;
          }

          // Figure out how tall the canvas should be
          const canvasHeight = ( ( rows * offset * 2 ) + ( rows * height ) );

          // Create the actual canvas with room for padding between the cards
          const canvas = Canvas.createCanvas( canvasWidth, canvasHeight );
          const context = canvas.getContext( '2d' );

          // Loop through each of the cards currently in the hand
          for( let i = 0; i < this.hand.length; i++ ) {

               // Get the filename for this card
               const cardImage = await Canvas.loadImage( './cards-png/' + this.deck.getFilename( this.hand[ i ] ) );

               // We need to know which column we working with
               let columnCount = i;

               // Figure out what row we're currently on
               let row = parseInt( i / maxColumns );

               // Assume we're working on the first row
               let y1 = offset;

               // If we're on card 6 and up, we need another row
               if( row > 0 ) {

                    // Start over at column 0
                    columnCount = i - ( row * maxColumns );

                    // Update y values
                    y1 = ( offset * ( row + 1 ) ) + ( height * row );
               }

               // Figure out the top left corner of this card
               let x1 = ( columnCount + 1 ) * offset + ( columnCount * width );

               // Add the current card to our image in the right place
               context.drawImage( cardImage, x1, y1, width, height );
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
          
          // Add the jokers
          this.deck.push( { suit: 'joker', rank: 'red' } );
          this.deck.push( { suit: 'joker', rank: 'black' } );
     }

     drawCard() {
          if( this.deck.length > 0 ) {

               // We need to subtract one because the function gives a range starting from 1
               const draw = this.getRandomNumber( 0, this.deck.length ) - 1;

               // Return the card we drew
               return this.deck.splice( draw, 1 )[ 0 ];
          }

          return false;
     }

     // Find out the filename for a card
     getFilename( card ) {

          // Assume we have a heart
          let suit = 'hearts';
          
          switch( card.suit ) {
               case 'd':
                    suit = 'diamonds';
                    break;

               case 'c':
                    suit = 'clubs';
                    break;

               case 's':
                    suit = 'spades';
                    break;

               case 'joker':
                    suit = 'joker';
                    break;

               default:
                    break;
          }

          // Assume we have a number card
          let rank = card.rank;

          // Check if this is a face card
          if( isNaN( rank ) ) {

               switch( card.rank ) {
                    case 'J':
                         rank = 'jack';
                         break;
                    case 'Q':
                         rank = 'queen';
                         break;

                    case 'K':
                         rank = 'king';
                         break;

                    case 'A':
                         rank = 'ace';
                         break;

                    default:
                         break;
               }
          }

          // Jokers are special
          if( suit == 'joker' ) {
               return rank + '_joker.png';
          }

          // Generate most of the filename
          let filename = rank + '_of_' + suit;

          // Use the alternate face cards
          if( isNaN( rank ) && rank != 'ace' ) {
               filename += '2';
          }

          return filename + '.png';
     }
     
     getRandomNumber( min, max ) {
          const range = max - min + 1;
          const buffer = crypto.randomBytes(4);
          const randomNumber = buffer.readUInt32LE(0) % range + min;
          return randomNumber;
      }
}
