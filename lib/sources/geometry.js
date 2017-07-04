goog.provide( 'zz.gl.Geometry' );

goog.require( 'goog.object' );
goog.require( 'zz.gl.enums.GeometryParameters' );
goog.require( 'zz.gl.enums.Primitives' );
goog.require( 'zz.gl.enums.BufferType' );
goog.require( 'zz.gl.enums.DrawMethod' );

/**
 * Geometry abstraction.
 */
zz.gl.Geometry = class {

    constructor( ) {

        this.parameters = { };
        goog.object.forEach(

            zz.gl.enums.GeometryParameters,
            function( value, key, params ) {

                this.parameters[ value ] = undefined;
            },
            this
        );

        this.first = undefined;
        this.count = undefined;
        this.primitive = undefined;
        this.method = undefined;
        this.modelMatrix = undefined;
    }

    /**
     * @param {number} first
     */
    setFirst( first ){

        this.first = first;
    }

    /**
     * @return {number|undefined}
     */
    getFirst( ){

        return this.first;
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @param {number} count
     */
    setCount( count ){

        this.count = count;
    }

    /**
     * @return {number|undefined}
     */
    getCount( paramName ){

        return this.count;
    }

    /**
     * @param {zz.gl.enums.Primitives} primitive
     */
    setPrimitive( primitive ){

        this.primitive = primitive;
    }

    /**
     * @return {zz.gl.enums.Primitives|undefined}
     */
    getPrimitive( ){

        return this.primitive;
    }

    /**
     * @param {zz.gl.enums.DrawMethod} method
     */
    setDrawMethod( method ){

        this.method = method;
    }

    /**
     * @return {zz.gl.enums.DrawMethod|undefined}
     */
    getDrawMethod( ){

        return this.method;
    }

    /**
     * @param {goog.vec.Mat4} matrix
     */
    setModelMatrix( matrix ){

        this.modelMatrix = matrix;
    }

    /**
     * @return {goog.vec.Mat4|undefined}
     */
    getModelMatrix( ){

        return this.modelMatrix;
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @param {Object} param
     */
    setParameter( paramName, param ){

        if( goog.object.containsKey( this.parameters, paramName ) ){

            this.parameters[ paramName ] = param;
        }
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @return {Object|undefined}
     */
    getParameter( paramName ){

        return this.parameters[ paramName ] || undefined;
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @param {zz.gl.enums.BufferType} type
     */
    setParameterBufferType( paramName, type ){

        var param = this.getParameter( paramName );
        if( param ){

            param[ 'bufferType' ] = type;
        }
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @return {zz.gl.enums.BufferType|undefined}
     */
    getParameterBufferType( paramName ){

        var type = undefined;
        var param = this.getParameter( paramName );
        if( param ){

            type = param[ 'bufferType' ];
        }

        return type;
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @param {Float32Array} data
     */
    setParameterData( paramName, data ){

        var param = this.getParameter( paramName );
        if( param ){

            param[ 'data' ] = data;
        }
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @return {Float32Array|undefined}
     */
    getParameterData( paramName ){

        var data = undefined;
        var param = this.getParameter( paramName );
        if( param ){

            data = param[ 'data' ];
        }

        return data;
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @param {number} countPerElement
     */
    setParameterCountPerElement( paramName, countPerElement ){

        var param = this.getParameter( paramName );
        if( param ){

            param[ 'countPerElement' ] = countPerElement;
        }
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @return {number|undefined}
     */
    getParameterCountPerElement( paramName ){

        var countPerElement = undefined;
        var param = this.getParameter( paramName );
        if( param ){

            countPerElement = param[ 'countPerElement' ];
        }

        return countPerElement;
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @param {number} stride
     */
    setParameterStride( paramName, stride ){

        var param = this.getParameter( paramName );
        if( param ){

            param[ 'stride' ] = stride;
        }
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @return {number|undefined}
     */
    getParameterStride( paramName ){

        var stride = undefined;
        var param = this.getParameter( paramName );
        if( param ){

            stride = param[ 'stride' ];
        }

        return stride;
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @param {number} offset
     */
    setParameterOffset( paramName, offset ){

        var param = this.getParameter( paramName );
        if( param ){

            param[ 'offset' ] = offset;
        }
    }

    /**
     * @param {zz.gl.enums.GeometryParameters} paramName
     * @return {number|undefined}
     */
    getParameterOffset( paramName ){

        var offset = undefined;
        var param = this.getParameter( paramName );
        if( param ){

            offset = param[ 'offset' ];
        }

        return offset;
    }
}