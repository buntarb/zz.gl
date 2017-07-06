goog.provide( 'zz.gl.Points' );

goog.require( 'zz.gl.Meshes' );

goog.require( 'zz.gl.enums.Primitives' );
goog.require( 'zz.gl.Geometry' );
goog.require( 'zz.gl.enums.GeometryParameters' );
goog.require( 'zz.gl.enums.DrawMethod' );
goog.require( 'zz.gl.enums.BufferType' );

/**
 * Scene worker for point geometries.
 * @param {number=} opt_expectedCount Expected count of points to achieve optimal performance.
 */
zz.gl.Points = class extends zz.gl.Meshes {

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
        config[ this.X ] = this.X;
        config[ this.Y ] = this.Y;
        config[ this.Z ] = this.Z;
        config[ this.COLOR_HEX ] = this.COLOR_HEX;
        config[ this.POINT_SIZE ] = this.POINT_SIZE;

        return config;
    }

    /**
     * @inheritDoc
     * @override
     */
    createOne( opt_params, opt_config ){

        this.checkIfFirstTime_( );
        this.checkIfEnough_( );

        var place = this.actualCount_ * this.LEN_BY_POINT;

        this.points_[ place++ ] = opt_params? opt_params[ this.getParamName( this.X, opt_config) ] || 0.0: 0.0;
        this.points_[ place++ ] = opt_params? opt_params[ this.getParamName( this.Y, opt_config) ] || 0.0: 0.0;
        this.points_[ place++ ] = opt_params? opt_params[ this.getParamName( this.Z, opt_config) ] || 0.0: 0.0;

        var color = zz.gl.Meshes.getColorRgbFromHex(

            opt_params? opt_params[ this.getParamName( this.COLOR_HEX, opt_config) ] || 0xFFFFFF: 0xFFFFFF
        );
        this.points_[ place++ ] = color[ 'r' ];
        this.points_[ place++ ] = color[ 'g' ];
        this.points_[ place++ ] = color[ 'b' ];

        this.points_[ place++ ] = opt_params? opt_params[ this.getParamName( this.POINT_SIZE, opt_config) ] || 1: 1;

        this.actualCount_++;

        var geometry = this.getGeometries( )[ 0 ];
        if( !geometry ){

            geometry = this.createGeometry_( );
            this.geometries_.push( geometry );
        }

        this.updateGeometryData_( geometry );
    }

    /**
     * @inheritDoc
     * @override
     */
    createMany( opt_params, opt_config ){ }

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

            this.points_ = zz.gl.Meshes.concatFloat32Array(

                this.points_,
                new Float32Array( this.LEN_BY_POINT )
            );
        }
    }
};
goog.addSingletonGetter( zz.gl.Points );
