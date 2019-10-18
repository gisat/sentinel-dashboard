import Framebuffer from '../framebuffer/Framebuffer';
import WorldWind from 'webworldwind-gisat';

const {
    ArgumentError,
    Logger,
    SurfaceShapeTileBuilder
} = WorldWind;

const fboCacheKey = 'SurfaceShapeFBO';

SurfaceShapeTileBuilder.prototype.buildTiles = function (dc) {
    if (!dc) {
        throw new ArgumentError(
            Logger.logMessage(Logger.LEVEL_SEVERE, 'SurfaceShapeTileBuilder', 'buildTiles', 'missingDc'));
    }

    if (!this.surfaceShapes || this.surfaceShapes.length < 1) {
        return;
    }

    // Assemble the current visible tiles and update their associated textures if necessary.
    this.assembleTiles(dc);

    if (SurfaceShapeTileBuilder.__fboBound__) {
        const fbo = SurfaceShapeTileBuilder.getFbo(dc);
        fbo.unbind(dc.currentGlContext, dc.currentFramebuffer);
        SurfaceShapeTileBuilder.__fboBound__ = false;
    }

    // Clean up references to all surface shapes to avoid dangling references. The surface shape list is no
    // longer needed, now that the shapes are held by each tile.
    this.surfaceShapes.splice(0, this.surfaceShapes.length);
    for (var idx = 0, len = this.surfaceShapeTiles.length; idx < len; idx += 1) {
        var tile = this.surfaceShapeTiles[idx];
        tile.clearShapes();
    }
};


SurfaceShapeTileBuilder.prototype.addTile = function (dc, tile) {
    if (dc.pickingMode) {
        tile.pickSequence = SurfaceShapeTileBuilder.pickSequence;
    }

    if (tile.needsUpdate(dc)) {

        //debugger;
        const fbo = SurfaceShapeTileBuilder.getFbo(dc);
        if (!SurfaceShapeTileBuilder.__fboBound__) {
            fbo.bind(dc.currentGlContext, this.tileWidth, this.tileHeight);
            SurfaceShapeTileBuilder.__fboBound__ = true;
        }

        tile.updateTexture(dc);
    }

    this.surfaceShapeTiles.push(tile);
};

SurfaceShapeTileBuilder.getFbo = function (dc) {
    let fbo = dc.gpuResourceCache.resourceForKey(fboCacheKey);
    if (!fbo) {
        fbo = new Framebuffer();
        dc.gpuResourceCache.putResource(fboCacheKey, fbo, 1);
    }
    return fbo;
};

SurfaceShapeTileBuilder.__frameStart__ = false;
SurfaceShapeTileBuilder.__fboBound__ = false;