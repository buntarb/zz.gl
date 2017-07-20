goog.provide( 'zz.gl.ALines' );

goog.require( 'zz.gl.AMeshes' );

goog.require( 'zz.gl.enums.Primitives' );
goog.require( 'zz.gl.Geometry' );
goog.require( 'zz.gl.enums.GeometryParameters' );
goog.require( 'zz.gl.enums.DrawMethod' );
goog.require( 'zz.gl.enums.BufferType' );

/**
 * This abstract class is a scene worker for meshes with line geometries.
 * @param {number=} opt_expectedCount Expected count of points to achieve optimal performance.
 */
zz.gl.ALines = class extends zz.gl.AMeshes {

	constructor( opt_expectedCount ){

	    super( opt_expectedCount );

        /**
         * A map of arrays of vertices and colors.
         * Each key is a line id that has given from counter.
         * @type {Object.<string, Array.<Float32Array>>}
         * @private
         */
        this.linesMap_ = { };

        /**
         * Actual count of lines
         * @type {number}
         * @private
         */
        this.actualCount_ = 0;

        /**
         * The required length to store vertex information in array.
         * @const
         * @type {number}
         */
        this.LEN = 3;
	}

    /**
     * @inheritDoc
     * @override
     */
    getDefaultParamsConfig( opt_params, opt_config ){

        var config = { };

        config[ this.DIM_X ] = this.DIM_X;
        config[ this.OFFSET_DIM_X ] = this.OFFSET_DIM_X;
        config[ this.STRIDE_DIM_X ] = this.STRIDE_DIM_X;
        config[ this.DIM_Y ] = this.DIM_Y;
        config[ this.OFFSET_DIM_Y ] = this.OFFSET_DIM_Y;
        config[ this.STRIDE_DIM_Y ] = this.STRIDE_DIM_Y;
        config[ this.DIM_Z ] = this.DIM_Z;
        config[ this.OFFSET_DIM_Z ] = this.OFFSET_DIM_Z;
        config[ this.STRIDE_DIM_Z ] = this.STRIDE_DIM_Z;
        config[ this.DIM_COLOR ] = this.DIM_COLOR;
        config[ this.OFFSET_DIM_COLOR ] = this.OFFSET_DIM_COLOR;
        config[ this.STRIDE_DIM_COLOR ] = this.STRIDE_DIM_COLOR;

        return config;
    }

    /**
     * @inheritDoc
     * @override
     * @abstract
     */
    create( opt_params, opt_config ){ }

    /**
     * Create one line from dimensions.
     * @protected
     */
    createLineInternal(
        countVertex,
        dimX, offsetDimX, strideDimX,
        dimY, offsetDimY, strideDimY,
        dimZ, offsetDimZ, strideDimZ,
        dimColor, offsetDimColor, strideDimColor
    ){

        var line = [ ];
        line[ 0 ] = new Float32Array( countVertex * this.LEN );
        line[ 1 ] = new Float32Array( countVertex * this.LEN );

        var iX = 0;
        var iY = 0;
        var iZ = 0;
        var iColor = 0;

        var iVertex = 0;
        var iVertexColor = 0;

        for( var i = 0; i < countVertex; i++ ){

            line[ 0 ][ iVertex++ ] = dimX[ offsetDimX + iX ];
            line[ 0 ][ iVertex++ ] = dimY[ offsetDimY + iY ];
            line[ 0 ][ iVertex++ ] = dimZ[ offsetDimZ + iZ ];

            var color = zz.gl.AMeshes.getColorRgbFromHex( dimColor[ offsetDimColor + iColor ] );
            line[ 1 ][ iVertexColor++ ] = color[ 'r' ];
            line[ 1 ][ iVertexColor++ ] = color[ 'g' ];
            line[ 1 ][ iVertexColor++ ] = color[ 'b' ];

            iX = iX + strideDimX;
            iY = iY + strideDimY;
            iZ = iZ + strideDimZ;
            iColor = iColor + strideDimColor;
        }

        this.linesMap_[ '' + this.actualCount_ ] = line;
        this.actualCount_++;

        var geometry = this.createGeometryInternal( line );
        this.geometries_.push( geometry );
    }

    /**
     * Create new geometry.
     * @param {Array.<Float32Array>} line An array of vertices and colors.
     * @return {zz.gl.Geometry}
     * @protected
     */
    createGeometryInternal( line ){

        var geometry = new zz.gl.Geometry( );

        var param = zz.gl.enums.GeometryParameters.POSITION;
        geometry.setParameter( param, { } );
        geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        geometry.setParameterCountPerElement( param, this.LEN );
        geometry.setParameterStride( param, line[ 0 ].BYTES_PER_ELEMENT * this.LEN );
        geometry.setParameterOffset( param, line[ 0 ].BYTES_PER_ELEMENT * 0 );
        geometry.setParameterData( param, line[ 0 ] );

        param = zz.gl.enums.GeometryParameters.COLOR;
        geometry.setParameter( param, { } );
        geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        geometry.setParameterCountPerElement( param, this.LEN );
        geometry.setParameterStride( param, line[ 1 ].BYTES_PER_ELEMENT * this.LEN );
        geometry.setParameterOffset( param, line[ 1 ].BYTES_PER_ELEMENT * 0 );
        geometry.setParameterData( param, line[ 1 ] );

        geometry.setDrawMethod( zz.gl.enums.DrawMethod.DRAW_ARRAYS );
        geometry.setPrimitive( zz.gl.enums.Primitives.LINE_STRIP );
        // geometry.setPrimitive( zz.gl.enums.Primitives.LINES );
        geometry.setFirst( 0 );
        geometry.setCount( line[ 0 ].length / this.LEN );

        return geometry;
    }
};
goog.addSingletonGetter( zz.gl.ALines );
