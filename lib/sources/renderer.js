goog.provide( 'zz.gl.Renderer' );

goog.require( 'zz.gl.ShaderProgram' );
goog.require( 'zz.gl.OrthographicCamera' );

goog.require( 'zz.gl.enums.GeometryParameters' );
goog.require( 'zz.gl.enums.BufferType' );
goog.require( 'zz.gl.enums.DrawMethod' );
goog.require( 'zz.gl.enums.Primitives' );

goog.require( 'goog.array' );
goog.require( 'goog.object' );
goog.require( 'goog.Timer' );


/**
 * Renderer WebGL.
 * @param {Element} canvas
 */
zz.gl.Renderer = class {

    constructor( canvas ) {

        this.canvas = canvas;

        // Shader
        this.defaultVS_ = [

            'attribute vec4 aPosition;',
            'attribute vec4 aColor;',
            'attribute vec4 aNormal;',
            'attribute float aPointSize;',

            'uniform mat4 uViewMatrix;',
            'uniform mat4 uProjMatrix;',
            'uniform mat4 uModelMatrix;',

            'uniform bool uUseModelMatrix;',
            'uniform bool uUseColor;',
            'uniform bool uUsePointSize;',
            'uniform bool uUseNormal;',

            'varying vec4 vColor;',
            'varying vec3 vNormal;',

            'vec4 modelPositionMatrix;',

            'void main() {',

            '   if( uUseModelMatrix ){',

            '       modelPositionMatrix = uModelMatrix * aPosition;',

            '   }else{',

            '       modelPositionMatrix = aPosition;',
            '   }',

            '   if( uUsePointSize ){',

            '       gl_PointSize = aPointSize;',

            '   }',

            '   gl_Position = uProjMatrix * uViewMatrix * modelPositionMatrix;',

            '   if( uUseColor ){',

            '       vColor = aColor;',

            '   }else{',

            '       vColor = vec4( 1.0, 1.0, 1.0, 1.0 );',
            // '       vColor = vec4( aPosition.x, 1.0, 1.0, 1.0 );',

            '   }',

            '   vNormal = vec3( 0, 0, 1 );',
            '   if( uUseNormal ){',

            '       vNormal = normalize( aNormal.xyz );',

            '   }',

            '}'

        ].join( "\n" );

        this.defaultFS_ = [

            'precision mediump float;',
            'varying vec4 vColor;',
            'varying vec3 vNormal;',

            'uniform bool uUseLight;',

            'void main() {',

            '   vec3 normal = normalize(vNormal);', //it's better
            // '   vec3 normal = vNormal;',

            '   vec3 lightDirection = vec3( 0.0, 0.0, 1.0 );',
            '   float nDotL = 1.0;',
            '   if( uUseLight ){',

            '       nDotL = max( dot( normal, lightDirection ), 0.0 );',

            '   }',

            '   vec4 color = vec4( vColor.rgb * nDotL, vColor.a );',

            '   gl_FragColor = color;',

            '}'
        ].join( "\n" );

        // this.camera = new Camera.OrbitCamera( canvas );
        // this.camera.maxDistance = 50;
        // this.camera.minDistance = 15;
        // this.camera.distanceStep = 0.01;
        // this.camera.setDistance( 20 );
        // this.camera.setCenter( [0, 0, 0] );
        // this.camera.setYUp( false );

        // this.light = new Light.DirectionalLight( );
        // this.light.direction[0] = -0.2;
        // this.light.direction[1] = -0.2;
        // this.light.direction[2] = 1.0;

        // this.projectionMat = mat4.create( );

        this.gl = zz.gl.Renderer.getWebGLContext( canvas );
        if( !this.gl ){

            throw 'Error creating WebGL context.';
        }
        this.gl.getExtension( 'OES_element_index_uint' );

        this.bufferPosition_ = this.gl.createBuffer( );
        this.bufferIndex_ = this.gl.createBuffer( );
        this.bufferColor_ = this.gl.createBuffer( );
        this.bufferNormal_ = this.gl.createBuffer( );
        this.bufferPointSize_ = this.gl.createBuffer( );

        this.supportedGeomParams_ = { };

        this.supportedGeomParams_[ zz.gl.enums.GeometryParameters.NORMAL ] = {

            'name': 'aNormal',
            'selector': 'uUseNormal',
            'buffer': this.bufferNormal_
        };
        this.supportedGeomParams_[ zz.gl.enums.GeometryParameters.COLOR ] = {

            'name': 'aColor',
            'selector': 'uUseColor',
            'buffer': this.bufferColor_
        };
        this.supportedGeomParams_[ zz.gl.enums.GeometryParameters.POINTSIZE ] = {

            'name': 'aPointSize',
            'selector': 'uUsePointSize',
            'buffer': this.bufferPointSize_
        };

        // If it is indexed then array buffer must be filled by positions at the last time.
        // So the order is important in that case.
        this.supportedGeomParams_[ zz.gl.enums.GeometryParameters.POSITION ] = {

            'name': 'aPosition',
            'buffer': this.bufferPosition_
        };
        this.supportedGeomParams_[ zz.gl.enums.GeometryParameters.INDEX ] = {

            'name': undefined,
            'buffer': this.bufferIndex_
        };

        this.clearColor_ = 0x000000;
        // this.clearColor_ = 0xFFFFFF;
        this.clearAlpha_ = 1.0;
        this.setClearColor( this.clearColor_, this.clearAlpha_ );
        // this.gl.clearDepth( 1.0 );

        this.gl.enable( this.gl.DEPTH_TEST ); // Enable depth test
        // this.gl.enable( this.gl.CULL_FACE );
        // this.gl.cullFace( this.gl.BACK );
        // this.gl.blendFuncSeparate( this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ZERO, this.gl.ONE );
        // this.gl.enable(this.gl.BLEND);

        // this.defaultShader = GLUtil.createProgram( this.gl, defaultVS, defaultFS );
        // this.instancedShader = GLUtil.createProgram( this.gl, instancedVS, defaultFS );
        this.program_ = new zz.gl.ShaderProgram( this.gl, undefined, this.defaultVS_, this.defaultFS_ );
        console.log( this.program_ );
        this.gl.useProgram( this.program_.program );

        console.log("list of used attributes");
        console.log("-----------------------");

        var numAttribs = this.gl.getProgramParameter(this.program_.program, this.gl.ACTIVE_ATTRIBUTES);
        for (var ii = 0; ii < numAttribs; ++ii) {
            var attribInfo = this.gl.getActiveAttrib(this.program_.program, ii);
            if (!attribInfo) {
                break;
            }
            console.log(this.gl.getAttribLocation(this.program_.program, attribInfo.name), attribInfo.name);
        }

        this.gl.uniform1i( this.program_.uniforms[ 'uUseLight' ], true );

        /**
         *
         * @type {Array<zz.gl.ISceneWorker>}
         * @private
         */
        this.sceneWorkers_ = [ ];

        var max = Math.max( this.canvas.width, this.canvas.height ) / 2;
        this.defaultCamera = new zz.gl.OrthographicCamera(

            -this.canvas.width / max,
            this.canvas.width / max,
            -this.canvas.height / max,
            this.canvas.height / max,
            -2000,
            2000
        );

        this.tasks_ = [ ];
    }

    drawGeometry( geometry, indexGeometry ) {

        var drawMethod = geometry.getDrawMethod( );
        var primitive = geometry.getPrimitive( );
        var first = geometry.getFirst( );
        var count = geometry.getCount( );

        if( drawMethod && primitive && first >= 0  && count >= 0 ){

            goog.object.forEach(

                this.supportedGeomParams_,
                function ( supportedParam, paramName, allSupportedParams ) {

                    var disable = true;
                    var selector = supportedParam['selector'];
                    var supportedParamName = supportedParam[ 'name' ];

                    var geomParam = geometry.getParameter( paramName );
                    if ( geomParam ) {

                        var bufferType = geometry.getParameterBufferType( paramName );
                        if( bufferType ){

                            var data = geometry.getParameterData( paramName );
                            if( data ){

                                this.gl.bindBuffer( this.gl[ bufferType ], supportedParam[ 'buffer' ] );
                                this.gl.bufferData( this.gl[ bufferType ], data, this.gl.STATIC_DRAW );

                                if( paramName === zz.gl.enums.GeometryParameters.INDEX ){

                                    disable = false;

                                } else {

                                    var countPerElement =
                                        geometry.getParameterCountPerElement( paramName );
                                    var stride = geometry.getParameterStride( paramName );
                                    var offset = geometry.getParameterOffset( paramName );

                                    if( countPerElement > 0 && stride >= 0 && offset >= 0 ){

                                        if( supportedParamName ){

                                            this.gl.vertexAttribPointer(

                                                this.program_.attributes[ supportedParamName ],
                                                countPerElement,
                                                this.gl.FLOAT,
                                                false,
                                                stride,
                                                offset
                                            );
                                        }

                                        // console.log(supportedParamName);

                                        // this.gl.bindBuffer( this.gl[ bufferType ], null );
                                        disable = false;
                                    }
                                }
                            }
                        }

                    }

                    if ( selector ) {

                        if( disable ){

                            this.gl.uniform1i( this.program_.uniforms[ selector ], false );
                            if( supportedParamName ){

                                this.gl.disableVertexAttribArray(

                                    this.program_.attributes[ supportedParamName ]
                                );
                            }

                        }else{

                            this.gl.uniform1i( this.program_.uniforms[ selector ], true );
                            if( supportedParamName ){

                                this.gl.enableVertexAttribArray(

                                    this.program_.attributes[ supportedParamName ]
                                );
                            }
                        }
                    }

                }, this
            );

            var geomModelMatrix = geometry.getModelMatrix( );
            if( geomModelMatrix ){

                this.gl.uniformMatrix4fv(

                    this.program_.uniforms[ 'uModelMatrix' ],
                    false,
                    geomModelMatrix.elements
                );

                this.gl.uniform1i( this.program_.uniforms[ 'uUseModelMatrix' ], true );

            }else{

                this.gl.uniform1i( this.program_.uniforms[ 'uUseModelMatrix' ], false );
            }

            switch ( drawMethod ) {

                case zz.gl.enums.DrawMethod.DRAW_ARRAYS:
                    this.gl.drawArrays(

                        this.gl[ primitive ],
                        first,
                        count
                    );
                    break;
                case zz.gl.enums.DrawMethod.DRAW_ELEMENTS:
                    this.gl.drawElements(

                        this.gl[ primitive ],
                        count,
                        this.gl.UNSIGNED_INT, // !!!!!!!!!!!!!!!!!
                        first
                    );
                    break;
            }
        }
    }

    drawGeometryDelay( geometry, indexGeometry ){

        var renderer = this;
        var geom = geometry;
        var index = indexGeometry;

        var draw = function ( ) {

            renderer.drawGeometry( geom, index );
        };
        var drawRequestAnimationFrame = function ( ) {

            goog.global.requestAnimationFrame( draw );
        };

        var taskId = goog.Timer.callOnce(

            draw,
            // drawRequestAnimationFrame,
            // index,
            0,
            this
        );

        // var taskId = goog.global.requestAnimationFrame( draw );

        this.tasks_.push( taskId );
    }

    /**
     * Draw scene by camera.
     * @param {zz.gl.ICamera} opt_camera Orthographic camera is default .
     */
    render( opt_camera, useDelayTasks ) {

        var camera = opt_camera || this.defaultCamera;
        this.gl.uniformMatrix4fv(

            this.program_.uniforms[ 'uProjMatrix' ],
            false,
            // camera.getProjectionMatrix( ).elements
            camera.getProjectionMatrix( )
        );
        this.gl.uniformMatrix4fv(

            this.program_.uniforms[ 'uViewMatrix' ],
            false,
            // camera.getViewMatrix( ).elements
            camera.getViewMatrix( )
        );

        if( useDelayTasks ){

            var lTasks = this.tasks_.length -1;
            while( lTasks >= 0 ){

                var task = this.tasks_.unshift( );
                lTasks--;
                // goog.global.cancelAnimationFrame( task );
                goog.Timer.clear( task );
            }
        }
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

        goog.array.forEach(

            this.sceneWorkers_,
            function( /**@type {zz.gl.ISceneWorker}*/ sceneWorker, index ){

                goog.array.forEach(

                    sceneWorker.getGeometries( ),
                    useDelayTasks? this.drawGeometryDelay: this.drawGeometry,
                    this
                );
            }, this
        );
    }

    addSceneWorker( sceneWorker ){

        this.sceneWorkers_.push( sceneWorker );
    }

    setViewport( x, y, width, height ) {

        this.gl.viewport( x, y, width, height );

    }

    resize( ) {

        this.setViewport( 0, 0, this.canvas.width, this.canvas.height );
        // mat4.perspective( 45, canvas.width/canvas.height, 1.0, 1024.0, this.projectionMat );
    }

    /**
     * Set color for clear background.
     * @param {number} color must be hex
     * @param {number} alpha must be float
     */
    setClearColor( color, alpha ) {

        color = color || this.clearColor_;
        alpha = alpha || this.clearAlpha_;

        this.gl.clearColor( 

            ( color >> 16 & 255 ) / 255,
            ( color >> 8 & 255 ) / 255,
            ( color & 255 ) / 255,
            alpha
        );

        this.clearColor_ = color;
        this.clearAlpha_ = alpha;

    }

    /**
     * Get clear color.
     * @return {number}
     */
    getClearColor( ) {

        return this.clearColor_;

    }

    /**
     * Get clear alpha.
     * @return {number}
     */
    getClearAlpha( ) {

        return this.clearAlpha_;

    }

    /**
     * Initialize and get the rendering for WebGL
     * @param {Element} canvas <cavnas> element
     * @return the rendering context for WebGL
     */
    static getWebGLContext( canvas ) {

        var names = [ "webgl", "experimental-webgl", "webkit-3d", "moz-webgl" ];
        var context = null;
        for ( var i = 0; i < names.length; ++i ) {

            try {

                context = canvas.getContext( names[ i ], { preserveDrawingBuffer: true } );

            } catch( e ) { }

            if ( context ) {

                break;
            }
        }

        return context;
    }

    getPrimitiveGL( primitiveEnum ){

        // POINTS LINES LINE_STRIP LINE_LOOP TRIANGLES TRIANGLE_STRIP TRIANGLE_FAN

        switch ( primitiveEnum ) {

            case zz.gl.enums.Primitives.POINT:
                return this.gl.POINTS;
            case zz.gl.enums.Primitives.LINE:
                return this.gl.LINES;

            default:
                return false;
        }
    }
};
