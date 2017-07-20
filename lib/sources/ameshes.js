goog.provide( 'zz.gl.AMeshes' );

goog.require( 'goog.math.interpolator.Linear1' );

/**
 * Abstract class for all scene workers.
 * @param {number=} opt_expectedCount Expected count of meshes to achieve optimal performance.
 * @implements {zz.gl.ISceneWorker}
 * @abstract
 */
zz.gl.AMeshes = class {

	constructor( opt_expectedCount ){

        /**
         * For implementing zz.gl.ISceneWorker's getGeometries method
         * @type {Array<zz.gl.Geometry>}
         * @private
         */
	    this.geometries_ = [ ];

        /**
         * Flag that we expect certain number of meshes.
         * It belongs to a performance feature.
         * @type {boolean}
         * @private
         */
        this.isSetExpectedCount_ = false;

        /**
         * Expected number of meshes if it is known.
         * It belongs to a performance feature.
         * @type {number}
         * @private
         */
        this.expectedCount_ = opt_expectedCount || 0;
        this.setExpectedCount( this.expectedCount_ );

        /**
         * A map of parameter names to use in mesh creation.
         * @type {Object.<string, string>}
         * @private
         */
        this.currentParamsConfig_ = { };
        this.initParamsNameInternal( );
        this.setCurrentParamsConfig( this.getDefaultParamsConfig( ) );
	}

    /**
     * Implementing zz.gl.ISceneWorker method
     * @inheritDoc
     * @override
     */
    getGeometries( ){

        return this.geometries_;
    }

    /**
     * Create one or many meshes.
     * A child class must override this method to set up a logic of creating a mesh instance.
     * @param {*} opt_params Use this to pass any parameters.
     * @param {Object.<string, string>} opt_config A map of parameter names.
     * @abstract
     */
    create( opt_params, opt_config ){ }

    /**
     * Call this once if you know how many meshes you expect.
     * It has effect only for first call.
     * @param {number} count
     */
    setExpectedCount( count ){

        if( !this.isSetExpectedCount_ && count > 0 ){

            this.expectedCount_ = count;
            this.isSetExpectedCount_ = true;
        }
    }

    /**
     * Get expected count of meshes.
     * @return {number}
     */
    getExpectedCount( ){

        return this.expectedCount_;
    }

    /**
     * Check if setExpectedCount method was called.
     * @return {boolean}
     */
    isSetExpectedCount( ){

        return this.isSetExpectedCount_;
    }

    /**
     * Get default config map of parameter names to use in mesh creation
     * if config hasn't been provided in createOne and createMany methods.
     * There is not a property for this getter so we don't define setter for it.
     * You must override this method to get config with supported parameter names.
     * @return {Object.<string, string>}
     * @abstract
     */
    getDefaultParamsConfig( ){ }

    /**
     * Set current config map of parameter names to use in mesh creation.
     * @param {Object.<string, string>} config A map of parameter names.
     *  Use it if you want to change default naming of supported parameters
     */
    setCurrentParamsConfig( config ){

        this.currentParamsConfig_ = config;
    }

    /**
     * Get current config map of parameter names to use in mesh creation.
     * @return {Object.<string, string>}
     */
    getCurrentParamsConfig( ){

        return this.currentParamsConfig_;
    }

    /**
     * Get parameter name to use in mesh creation.
     * @param {string} name A parameter name.
     *  Use here some of the parameter constants to request an actual name of parameter.
     * @param {Object.<string, string>} opt_config A map of parameter names.
     *  It has a primary priority over the current config.
     * @return {string|undefined}
     */
    getParamName( name, opt_config ){

        var config = opt_config || this.currentParamsConfig_;
        return config[ name ];
    }

    /**
     * Get dimension array by parameter name.
     * @param {string} name A parameter name.
     * @param {*} opt_params Some parameters.
     * @param {Object.<string, string>} opt_config A map of parameter names.
     * @param {*} opt_defaultValue Default value for a dimension element.
     * @return {Array}
     */
    getDimByParamName( name, opt_params, opt_config, opt_defaultValue ){

        var actualParamName = this.getParamName( name, opt_config );
        var defaultValue = opt_defaultValue || 0.0;
        var dim = opt_params? opt_params[ actualParamName ] || [ defaultValue ]: [ defaultValue ];
        if( !goog.isArray( dim ) ){

            dim = [ dim ];
        }

        return dim;
    }

    /**
     * Get parameter value by its name.
     * @param {string} name A parameter name.
     * @param {*} opt_params Some parameters.
     * @param {Object.<string, string>} opt_config A map of parameter names.
     * @param {*} opt_defaultValue Default value if not found.
     * @return {Array}
     */
    getValueByParamName( name, opt_params, opt_config, opt_defaultValue ){

        var actualParamName = this.getParamName( name, opt_config );
        return opt_params? opt_params[ actualParamName ] || opt_defaultValue: opt_defaultValue;
    }

    /**
     * Concatenate two Float32Array arrays into new Float32Array array.
     * @param {Float32Array} first
     * @param {Float32Array} second
     * @return {Float32Array}
     */
    static concatFloat32Array( first, second ){

        var result = new Float32Array( first.length + second.length );

        result.set( first );
        result.set( second, first.length );

        return result;
    }

    /**
     * Concatenate two Uint32Array arrays into new Uint32Array array.
     * @param {Uint32Array} first
     * @param {Uint32Array} second
     * @return {Uint32Array}
     */
    static concatUint32Array( first, second ){

        var result = new Uint32Array( first.length + second.length );

        result.set( first );
        result.set( second, first.length );

        return result;
    }

    /**
     * Convert hex color to rgba. An a-component is always 1.0.
     * @param {number} hexColor
     * @return {Object.<string, number>}
     */
    static getColorRgbFromHex( hexColor ){

        return {

            'r': ( hexColor >> 16 & 255 ) / 255,
            'g': ( hexColor >> 8 & 255 ) / 255,
            'b': ( hexColor & 255 ) / 255,
            'a': 1.0
        };
    }

    static getAlignedLerpDim( countVertex, sourceDim, offsetSourceDim, strideSourceDim ){

        var sourceVertexCount = Math.floor( sourceDim.length / strideSourceDim );
        var scaleSegment = ( countVertex - 1 ) / ( sourceVertexCount - 1 );
        var iColor = 0;
        var scaledIndex = 0;
        var scaledXs = [ ];
        var ys = new Float32Array( sourceVertexCount );
        var iY = 0;

        for( var i = 0; i < sourceVertexCount; i++ ){

            scaledXs.push( scaledIndex );
            ys[ iY++ ] = sourceDim[ offsetSourceDim + iColor ];

            scaledIndex += scaleSegment;
            iColor += strideSourceDim;
        }

        var linearInterpolator = new goog.math.interpolator.Linear1( );
        linearInterpolator.setData( scaledXs, ys );
        var lerpedDim = new Float32Array( countVertex );

        for( var j = 0; j < countVertex; j++ ){

            lerpedDim[ j ] = linearInterpolator.interpolate( j );
        }

        return lerpedDim;
    }

    static getAlignedLerpColorDim( countVertex, sourceColorDim, offsetSourceColorDim, strideSourceColorDim ){

        var sourceColorVertexCount = Math.floor( sourceColorDim.length / strideSourceColorDim );
        var scaleColorSegment = ( countVertex - 1 ) / ( sourceColorVertexCount - 1 );
        var iColor = 0;
        var scaledIndex = 0;
        var scaledXs = [ ];
        var yRs = new Float32Array( sourceColorVertexCount );
        var yGs = new Float32Array( sourceColorVertexCount );
        var yBs = new Float32Array( sourceColorVertexCount );
        var iY = 0;

        for( var i = 0; i < sourceColorVertexCount; i++ ){

            scaledXs.push( scaledIndex );

            var rgb = zz.gl.AMeshes.getColorRgbFromHex( sourceColorDim[ offsetSourceColorDim + iColor ] );
            yRs[ iY ] = rgb[ 'r' ] * 255;
            yGs[ iY ] = rgb[ 'g' ] * 255;
            yBs[ iY++ ] = rgb[ 'b' ] * 255;

            scaledIndex += scaleColorSegment;
            iColor += strideSourceColorDim;
        }

        var linearInterpolatorR = new goog.math.interpolator.Linear1( );
        var linearInterpolatorG = new goog.math.interpolator.Linear1( );
        var linearInterpolatorB = new goog.math.interpolator.Linear1( );
        linearInterpolatorR.setData( scaledXs, yRs );
        linearInterpolatorG.setData( scaledXs, yGs );
        linearInterpolatorB.setData( scaledXs, yBs );
        var lerpedDimColor = new Float32Array( countVertex );

        for( var j = 0; j < countVertex; j++ ){

            var hex = ( linearInterpolatorR.interpolate( j ) << 16 ) +
                ( linearInterpolatorG.interpolate( j ) << 8 ) +
                ( linearInterpolatorB.interpolate( j ) );

            lerpedDimColor[ j ] = hex;
        }

        return lerpedDimColor;
    }

    /**
     * Sets up default property name constants.
     * It used by constructor.
     * @protected
     */
    initParamsNameInternal( ){

        /**
         * Default parameter name for dimension of x position(s).
         * @type {string}
         * @const
         */
        this.DIM_X = 'dimX';

        /**
         * Start position for DIM_X.
         * @type {string}
         * @const
         */
        this.OFFSET_DIM_X = 'offsetDimX';

        /**
         * Step for DIM_X.
         * @type {string}
         * @const
         */
        this.STRIDE_DIM_X = 'strideDimX';

        /**
         * Default parameter name for dimension of y position(s).
         * @type {string}
         * @const
         */
        this.DIM_Y = 'dimY';

        /**
         * Start position for DIM_Y.
         * @type {string}
         * @const
         */
        this.OFFSET_DIM_Y = 'offsetDimY';

        /**
         * Step for DIM_Y.
         * @type {string}
         * @const
         */
        this.STRIDE_DIM_Y = 'strideDimY';

        /**
         * Default parameter name for dimension of z position(s).
         * @type {string}
         * @const
         */
        this.DIM_Z = 'dimZ';

        /**
         * Start position for DIM_Z.
         * @type {string}
         * @const
         */
        this.OFFSET_DIM_Z = 'offsetDimZ';

        /**
         * Step for DIM_Z.
         * @type {string}
         * @const
         */
        this.STRIDE_DIM_Z = 'strideDimZ';

        /**
         * Default parameter name for dimension of color(s) with hex value.
         * @type {string}
         * @const
         */
        this.DIM_COLOR = 'dimColor';

        /**
         * Start position for DIM_COLOR.
         * @type {string}
         * @const
         */
        this.OFFSET_DIM_COLOR = 'offsetDimColor';

        /**
         * Step for DIM_COLOR.
         * @type {string}
         * @const
         */
        this.STRIDE_DIM_COLOR = 'strideDimColor';

        /**
         * Default parameter name for dimension of size(s).
         * @type {string}
         * @const
         */
        this.DIM_SIZE = 'dimSize';

        /**
         * Start position for DIM_SIZE.
         * @type {string}
         * @const
         */
        this.OFFSET_DIM_SIZE = 'offsetDimSize';

        /**
         * Step for DIM_SIZE.
         * @type {string}
         * @const
         */
        this.STRIDE_DIM_SIZE = 'strideDimSize';
    }
};
