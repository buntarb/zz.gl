goog.provide( 'zz.gl.Points' );

goog.require( 'zz.gl.AMeshes' );

goog.require( 'zz.gl.enums.Primitives' );
goog.require( 'zz.gl.Geometry' );
goog.require( 'zz.gl.enums.GeometryParameters' );
goog.require( 'zz.gl.enums.DrawMethod' );
goog.require( 'zz.gl.enums.BufferType' );

/**
 * Scene worker for meshes with point geometries.
 * @param {number=} opt_expectedCount Expected count of points to achieve optimal performance.
 */
zz.gl.Points = class extends zz.gl.AMeshes {

	constructor( opt_expectedCount ){

	    super( opt_expectedCount );

        /**
         * Store vertices colors and sizes in one array
         * @type {Float32Array}
         * @private
         */
        this.points_ = undefined;

        /**
         * Actual count of points
         * @type {number}
         * @private
         */
        this.actualCount_ = 0;

        /**
         * The required length to store in array for one point.
         * 3 for vertex, 3 for color and 1 for size per one point.
         * @const
         * @type {number}
         */
        this.LEN_BY_POINT = 7;
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
        config[ this.DIM_SIZE ] = this.DIM_SIZE;
        config[ this.OFFSET_DIM_SIZE ] = this.OFFSET_DIM_SIZE;
        config[ this.STRIDE_DIM_SIZE ] = this.STRIDE_DIM_SIZE;

        return config;
    }

    /**
     * @inheritDoc
     * @override
     */
    create( opt_params, opt_config ){

        var dimX = this.getDimByParamName( this.DIM_X, opt_params, opt_config );
        var offsetDimX = this.getValueByParamName( this.OFFSET_DIM_X, opt_params, opt_config, 0 );
        var strideDimX = this.getValueByParamName( this.STRIDE_DIM_X, opt_params, opt_config, 1 );
        var dimY = this.getDimByParamName( this.DIM_Y, opt_params, opt_config );
        var offsetDimY = this.getValueByParamName( this.OFFSET_DIM_Y, opt_params, opt_config, 0 );
        var strideDimY = this.getValueByParamName( this.STRIDE_DIM_Y, opt_params, opt_config, 1 );
        var dimZ = this.getDimByParamName( this.DIM_Z, opt_params, opt_config );
        var offsetDimZ = this.getValueByParamName( this.OFFSET_DIM_Z, opt_params, opt_config, 0 );
        var strideDimZ = this.getValueByParamName( this.STRIDE_DIM_Z, opt_params, opt_config, 1 );
        var dimColor = this.getDimByParamName( this.DIM_COLOR, opt_params, opt_config, 0xFFFFFF );
        var offsetDimColor = this.getValueByParamName( this.OFFSET_DIM_COLOR, opt_params, opt_config, 0 );
        var strideDimColor = this.getValueByParamName( this.STRIDE_DIM_COLOR, opt_params, opt_config, 1 );
        var dimSize = this.getDimByParamName( this.DIM_SIZE, opt_params, opt_config, 1.0 );
        var offsetDimSize = this.getValueByParamName( this.OFFSET_DIM_SIZE, opt_params, opt_config, 0 );
        var strideDimSize = this.getValueByParamName( this.STRIDE_DIM_SIZE, opt_params, opt_config, 1 );

        var count = Math.floor( Math.max(

            dimX.length / strideDimX,
            dimY.length / strideDimY,
            dimZ.length / strideDimZ
        ) );

        if( Math.floor( dimX.length / strideDimX ) !== count ){

            dimX = zz.gl.AMeshes.getAlignedLerpDim( count, dimX, offsetDimX, strideDimX );
            offsetDimX = 0;
            strideDimX = 1;
        }
        if( Math.floor( dimY.length / strideDimY ) !== count ){

            dimY = zz.gl.AMeshes.getAlignedLerpDim( count, dimY, offsetDimY, strideDimY );
            offsetDimY = 0;
            strideDimY = 1;
        }
        if( Math.floor( dimZ.length / strideDimZ ) !== count ){

            dimZ = zz.gl.AMeshes.getAlignedLerpDim( count, dimZ, offsetDimZ, strideDimZ );
            offsetDimZ = 0;
            strideDimZ = 1;
        }
        if( Math.floor( dimZ.length / strideDimSize ) !== count ){

            dimSize = zz.gl.AMeshes.getAlignedLerpDim( count, dimSize, offsetDimSize, strideDimSize );
            offsetDimSize = 0;
            strideDimSize = 1;
        }
        if( Math.floor( dimColor.length / strideDimColor ) !== count ){

            dimColor = zz.gl.AMeshes.getAlignedLerpColorDim( count, dimColor, offsetDimColor, strideDimColor );
            offsetDimColor = 0;
            strideDimColor = 1;
        }

        var iX = 0;
        var iY = 0;
        var iZ = 0;
        var iColor = 0;
        var iSize = 0;

        for( var i = 0; i < count; i++ ){

            this.checkIfFirstTime_( );
            this.checkIfEnough_( );

            var place = this.actualCount_ * this.LEN_BY_POINT;

            this.points_[ place++ ] = dimX[ offsetDimX + iX ];
            this.points_[ place++ ] = dimY[ offsetDimY + iY ];
            this.points_[ place++ ] = dimZ[ offsetDimZ + iZ ];

            var color = zz.gl.AMeshes.getColorRgbFromHex( dimColor[ offsetDimColor + iColor ] );
            this.points_[ place++ ] = color[ 'r' ];
            this.points_[ place++ ] = color[ 'g' ];
            this.points_[ place++ ] = color[ 'b' ];

            this.points_[ place++ ] = dimSize[ offsetDimSize + iSize ];

            iX = iX + strideDimX;
            iY = iY + strideDimY;
            iZ = iZ + strideDimZ;
            iSize = iSize + strideDimSize;
            iColor = iColor + strideDimColor;

            this.actualCount_++;
        }

        var geometry = this.getGeometries( )[ 0 ];
        if( !geometry ){

            geometry = this.createGeometry_( );
            this.geometries_.push( geometry );
        }

        this.updateGeometryData_( geometry );
    }

    /**
     * Create new geometry.
     * @return {zz.gl.Geometry}
     * @private
     */
    createGeometry_( ){

        var geometry = new zz.gl.Geometry( );

        var param = zz.gl.enums.GeometryParameters.POSITION;
        geometry.setParameter( param, { } );
        geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        geometry.setParameterCountPerElement( param, 3 );
        geometry.setParameterStride( param, this.points_.BYTES_PER_ELEMENT * this.LEN_BY_POINT );
        geometry.setParameterOffset( param, this.points_.BYTES_PER_ELEMENT * 0 );

        param = zz.gl.enums.GeometryParameters.COLOR;
        geometry.setParameter( param, { } );
        geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        geometry.setParameterCountPerElement( param, 3 );
        geometry.setParameterStride( param, this.points_.BYTES_PER_ELEMENT * this.LEN_BY_POINT );
        geometry.setParameterOffset( param, this.points_.BYTES_PER_ELEMENT * 3 );

        param = zz.gl.enums.GeometryParameters.POINTSIZE;
        geometry.setParameter( param, { } );
        geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        geometry.setParameterCountPerElement( param, 1 );
        geometry.setParameterStride( param, this.points_.BYTES_PER_ELEMENT * this.LEN_BY_POINT );
        geometry.setParameterOffset( param, this.points_.BYTES_PER_ELEMENT * 6 );

        geometry.setDrawMethod( zz.gl.enums.DrawMethod.DRAW_ARRAYS );
        geometry.setPrimitive( zz.gl.enums.Primitives.POINTS);
        geometry.setFirst( 0 );

        return geometry;
    }

    /**
     * Update geometry parameters.
     * @param {zz.gl.Geometry} geometry
     * @private
     */
    updateGeometryData_( geometry ){

        var param = zz.gl.enums.GeometryParameters.POSITION;
        geometry.setParameterData( param, this.points_ );

        param = zz.gl.enums.GeometryParameters.COLOR;
        geometry.setParameterData( param, this.points_ );

        param = zz.gl.enums.GeometryParameters.POINTSIZE;
        geometry.setParameterData( param, this.points_ );

        geometry.setCount( this.actualCount_ );
    }

    /**
     * Initiate buffers.
     * @private
     */
    checkIfFirstTime_( ){

        if( !goog.isDef( this.points_ ) ){

            if( this.isSetExpectedCount( ) ) {

                this.points_ = new Float32Array( this.expectedCount_ * this.LEN_BY_POINT );

            }else{

                this.points_ = new Float32Array( this.LEN_BY_POINT );
            }
        }
    }

    /**
     * Increase buffers.
     * @private
     */
    checkIfEnough_( ){

        var freeCount = this.points_.length - this.actualCount_ * this.LEN_BY_POINT;
        if( freeCount < this.LEN_BY_POINT ){

            this.points_ = zz.gl.AMeshes.concatFloat32Array(

                this.points_,
                new Float32Array( this.LEN_BY_POINT )
            );
        }
    }
};
goog.addSingletonGetter( zz.gl.Points );
