// function built based on Stemkoski's
// http://stemkoski.github.io/Three.js/Texture-Animation.html

export default function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration, order) 
{	
    // note: texture passed by reference, will be updated by the update function.
        
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet. 
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
    texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

    // how long should each image be displayed?
    this.tileDisplayDuration = tileDispDuration;

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;

    // which image is currently being displayed?
    this.currentTile = 0;

    // order of the pic
    this.displayOrder = order;

        
    this.updateWithOrder = function( milliSec )
    {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration)
        {
            var currentColumn = this.displayOrder[ this.currentTile ] % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor( this.displayOrder[ this.currentTile ] / this.tilesHorizontal );
            texture.offset.y = currentRow / this.tilesVertical;

            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;

            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;

            // console.log(this.displayOrder[ this.currentTile ]);
        }
    };

    this.update = function( milliSec )
    {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration)
        {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;

            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;


            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
            texture.offset.y = currentRow / this.tilesVertical;

            console.log('currentTile: ' + this.currentTile + ', offset.x: ' + texture.offset.x);
        }
    };
}
