goog.provide( 'zz.gl.Meshes' );

/**
 * Abstract class for all scene workers.
 * @param {number=} opt_expectedCount Expected count of meshes to achieve optimal performance.
 * @implements {zz.gl.ISceneWorker}
 * @abstract
 */
zz.gl.Meshes = class {

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
     * Create one mesh.
     * A child class must override this method to set up a logic of creating a mesh instance.
     * If it is unnecessary you should override this with an empty method.
     * @param {*} opt_params Use this to pass any parameters.
     * @param {Object.<string, string>} opt_config A map of parameter names.
     * @abstract
     */
    createOne( opt_params, opt_config ){ }

    /**
     * Create many meshes.
     * A child class must override this method to set up a logic of creating mesh instances.
     * If it is unnecessary you should override this with an empty method.
     * @param {*} opt_params Use this to pass any parameters.
     * @param {Object.<string, string>} opt_config A map of parameter names.
     * @abstract
     */
    createMany( opt_params, opt_config ){ }

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

    /**
     * Sets up default property name constants.
     * It used by constructor.
     * @protected
     */
    initParamsNameInternal( ){

        /**
         * Default parameter name of x position.
         * @type {string}
         * @const
         */
        this.X = 'x';

        /**
         * Default parameter name of y position.
         * @type {string}
         * @const
         */
        this.Y = 'y';

        /**
         * Default parameter name of z position.
         * @type {string}
         * @const
         */
        this.Z = 'z';

        /**
         * Default parameter name of color with hex value.
         * @type {string}
         * @const
         */
        this.COLOR_HEX = 'colorHex';

        /**
         * Default parameter name of point size.
         * @type {string}
         * @const
         */
        this.POINT_SIZE = 'pointSize';

        /**
         * Default parameter name of vertices array.
         * @type {string}
         * @const
         */
        this.VERTICES = 'vertices';
    }
};
