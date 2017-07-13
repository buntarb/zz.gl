goog.provide( 'zz.gl.Renderer' );

goog.require( 'zz.gl.ShaderProgram' );
goog.require( 'zz.gl.OrthographicCamera' );

goog.require( 'zz.gl.enums.GeometryParameters' );
goog.require( 'zz.gl.enums.BufferType' );
goog.require( 'zz.gl.enums.DrawMethod' );
goog.require( 'zz.gl.enums.Primitives' );


/**
 * Renderer WebGL.
 * @param {Element} canvas
 */
zz.gl.Renderer = class {

    constructor( canvas ) {

        this.canvas = canvas;

        // Shader
        // this.defaultVS_ = [
        //
        //     'attribute vec4 aPosition;',
        //     'attribute vec4 aColor;',
        //     'attribute vec4 aNormal;',
        //     'attribute float aPointSize;',
        //
        //     'uniform mat4 uViewMatrix;',
        //     'uniform mat4 uProjMatrix;',
        //     'uniform mat4 uModelMatrix;',
        //
        //     'uniform bool uUseModelMatrix;',
        //     'uniform bool uUseColor;',
        //     'uniform bool uUsePointSize;',
        //     'uniform bool uUseNormal;',
        //
        //     'varying vec4 vColor;',
        //     'varying vec3 vNormal;',
        //
        //     'vec4 modelPositionMatrix;',
        //
        //     'void main() {',
        //
        //     '   if( uUseModelMatrix ){',
        //
        //     '       modelPositionMatrix = uModelMatrix * aPosition;',
        //
        //     '   }else{',
        //
        //     '       modelPositionMatrix = aPosition;',
        //     '   }',
        //
        //     '   if( uUsePointSize ){',
        //
        //     '       gl_PointSize = aPointSize;',
        //
        //     '   }',
        //
        //     '   gl_Position = uProjMatrix * uViewMatrix * modelPositionMatrix;',
        //
        //     '   if( uUseColor ){',
        //
        //     '       vColor = aColor;',
        //
        //     '   }else{',
        //
        //     '       vColor = vec4( 1.0, 1.0, 1.0, 1.0 );',
        //     // '       vColor = vec4( aPosition.x, 1.0, 1.0, 1.0 );',
        //
        //     '   }',
        //
        //     '   vNormal = vec3( 0, 0, 1 );',
        //     '   if( uUseNormal ){',
        //
        //     '       vNormal = normalize( aNormal.xyz );',
        //
        //     '   }',
        //
        //     '}'
        //
        // ].join( "\n" );
        //
        // this.defaultFS_ = [
        //
        //     'precision mediump float;',
        //     'varying vec4 vColor;',
        //     'varying vec3 vNormal;',
        //
        //     'uniform bool uUseLight;',
        //
        //     'void main() {',
        //
        //     '   vec3 normal = normalize(vNormal);', //it's better
        //     // '   vec3 normal = vNormal;',
        //
        //     '   vec3 lightDirection = vec3( 0.0, 0.0, 1.0 );',
        //     '   float nDotL = 1.0;',
        //     '   if( uUseLight ){',
        //
        //     '       nDotL = max( dot( normal, lightDirection ), 0.0 );',
        //
        //     '   }',
        //
        //     '   vec4 color = vec4( vColor.rgb * nDotL, vColor.a );',
        //
        //     '   gl_FragColor = color;',
        //
        //     '}'
        // ].join( "\n" );

        this.defaultVS_ = [

            'attribute vec4 aPosition;',
            'attribute vec4 aColor;',
            'attribute vec4 aNormal;',
            'attribute float aPointSize;',

            'attribute vec4 aKnot1;',
            'attribute vec4 aKnot2;',
            'attribute vec4 aKnot3;',

            'uniform mat4 uViewMatrix;',
            'uniform mat4 uProjMatrix;',
            'uniform mat4 uModelMatrix;',

            'uniform bool uUseModelMatrix;',
            'uniform bool uUseColor;',
            'uniform bool uUsePointSize;',
            'uniform bool uUseNormal;',

            'varying vec4 vColor;',
            'varying vec3 vNormal;',

            'varying vec4 vKnots;',
            'varying vec4 vKnot1;',
            'varying vec4 vKnot2;',
            'varying vec4 vKnot3;',

            'vec4 modelPositionMatrix;',

            'void main() {',

            '   if( uUseModelMatrix ){',

            '       modelPositionMatrix = uModelMatrix * aPosition;',

            '   }else{',

            '       modelPositionMatrix = aPosition;',
            '   }',

            '   if( uUsePointSize ){',

            '       gl_PointSize = aPointSize;',

            '   }else{',

            '       gl_PointSize = 5.0;',

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

            '   vKnots = aNormal;', // Here we attach some array to our knots.
            '   vKnot1 = aKnot1;',
            '   vKnot2 = aKnot2;',
            '   vKnot3 = aKnot3;',

            '   gl_Position = aPosition;',

            '}'

        ].join( "\n" );

        this.defaultFS_ = [

            'precision mediump float;',
            'varying vec4 vColor;',
            'varying vec3 vNormal;',

            'varying vec4 vKnots;', // Here we get our attached knots. I suppose )))
            'varying vec4 vKnot1;',
            'varying vec4 vKnot2;',
            'varying vec4 vKnot3;',

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

            '   float screenWidth = 600.0;',
            '   float screenHeight = 600.0;',
            '   float x = gl_FragCoord.x/screenWidth;',
            '   float y = gl_FragCoord.y/screenHeight;',
            '   float z = gl_FragCoord.z;',
            '   float ndcx = x * 2.0 - 1.0;',
            '   float ndcy = y * 2.0 - 1.0;',
            '   float ndcz = z * 2.0 - 1.0;',
            '   vec3 ndc = vec3(ndcx, ndcy, ndcz);',

            // '   float x1 = 1.0;',
            // '   float y1 = 1.0;',
            // '   float x2 = 1.0;',
            // '   float y2 = 0.0;',
            // '   float x3 = 0.0;',
            // '   float y3 = 1.0;',

            // '   float x1 = 1.0;',
            // '   float y1 = 0.0;',
            // '   float x2 = 0.0;',
            // '   float y2 = 1.0;',
            // '   float x3 = 1.0;',
            // '   float y3 = 1.0;',

            // '   float x1 = 0.0;',
            // '   float y1 = 1.0;',
            // '   float x2 = 1.0;',
            // '   float y2 = 1.0;',
            // '   float x3 = 1.0;',
            // '   float y3 = 0.0;',




            '   float x1 = vKnot1.x;',
            '   float y1 = vKnot1.y;',
            '   float x2 = vKnot2.x;',
            '   float y2 = vKnot2.y;',
            '   float x3 = vKnot3.x;',
            '   float y3 = vKnot3.y;',

            // '   float x1 = ( 1.0 + 0.5 ) / 2.0;',
            // '   float y1 = ( 1.0 + 0.5 ) / 2.0;',
            // '   float x2 = ( 1.0 + 0.5 ) / 2.0;',
            // '   float y2 = ( 1.0 + ( -0.5 ) ) / 2.0;',
            // '   float x3 = ( 1.0 + ( -0.5 ) ) / 2.0;',
            // '   float y3 = ( 1.0 + 0.5 ) / 2.0;',

            // '   float x1 = 0.25;',
            // '   float y1 = 0.75;',
            // '   float x2 = 0.75;',
            // '   float y2 = 0.75;',
            // '   float x3 = 0.75;',
            // '   float y3 = 0.25;',


            '   float s = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));',
            '   float t = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));',
            // '   float s = 1.0 - y;',
            // '   float t = x + y - 1.0;',

            // '   if( ( 1000.0 * ndc.y + 5.0 >= floor( 1000.0 * 0.3 * cos( 10.0 * ndc.x ) ) ) &&' +
            // '       ( 1000.0 * ndc.y - 5.0 <= ceil( 1000.0 * 0.3 * cos( 10.0 * ndc.x ) ) ) ){',
            //
            // '       color = vec4( 255, 0, 0, 1 );',
            //
            // '   }else{',
            //
            // // '       color = vec4( 0, 0, 0, 0 );',
            // '       discard;',  // Use discard for break drawing current pixel.
            // '   }',

            // '   if( vKnots.x > x && vKnots.y > y ){',
            // '   if( vKnots.x * vKnots.x - vKnots.y > 0.0 && vKnots.x * vKnots.x - vKnots.y < 0.01 ){',
            // '   if( vKnots.x * vKnots.x - vKnots.y > 0.0 ){',
            // '   if( x * x - y > 0.0 ){',
            // '   if( vKnots.y * vKnots.y - vKnots.x < 0.0 ){',
            // '   if( vKnots.x * vKnots.x - vKnots.y > 0.0 || vKnots.y * vKnots.y - vKnots.x < 0.0 ){',
            // '   if( (s/2.0 + t) * (s/2.0 + t) < t ){',
            '   if( (s/2.0 + t) * (s/2.0 + t) - t < 0.0 ){',
            // '   if( (s/2.0 + t) * (s/2.0 + t) - t < 0.0 && (s/2.0 + t) * (s/2.0 + t) - t > -0.05 ){',

            '       color = vec4( 1, 0, 0, 1 );',

            '   }else{',

            '       color = vec4( 0, 0, 1, 1 );',
            // '       discard;',  // Use discard for break drawing current pixel.
            '   }',

            // '   color = vec4( 1, 0, 0, 1 );',
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

        this.bufferKnot1_ = this.gl.createBuffer( );
        this.bufferKnot2_ = this.gl.createBuffer( );
        this.bufferKnot3_ = this.gl.createBuffer( );

        this.supportedGeomParams_ = { };


        this.supportedGeomParams_[ 'knot1' ] = {

            'name': 'aKnot1',
            'selector': undefined,
            'buffer': this.bufferKnot1_
        };
        this.supportedGeomParams_[ 'knot2' ] = {

            'name': 'aKnot2',
            'selector': undefined,
            'buffer': this.bufferKnot2_
        };
        this.supportedGeomParams_[ 'knot3' ] = {

            'name': 'aKnot3',
            'selector': undefined,
            'buffer': this.bufferKnot3_
        };



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


        // this._buildMonkey( this.gl );
        // this._buildInstances( this.gl, 10 );
        //
        // this.useHardwareInstancing = false;
        //
        // this.instanceExt = GLUtil.getExtension( this.gl, "ANGLE_instanced_arrays" );
        // if( !this.instanceExt ) {
        //     var customControls = document.getElementById( "customControls" );
        //     customControls.classList.add( "error" );
        //     customControls.innerHTML = "ANGLE_instanced_arrays not supported by this browser";
        //     this.instanceCheck = null;
        // } else {
        //     this.instanceCheck = document.getElementById( "hardwareInstancing" );
        // }

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
    }

    // var modelMat = mat4.identity( );

    // Renderer.prototype.draw = function ( this.gl, timing ) {

    /**
     * Draw scene by camera.
     * @param {zz.gl.ICamera} opt_camera Orthographic camera is default .
     */
    render( opt_camera ) {

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

        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );

        goog.object.forEach(

            this.sceneWorkers_,
            function( /**@type {zz.gl.ISceneWorker}*/ sceneWorker, index ){

                goog.object.forEach(

                    sceneWorker.getGeometries( ),
                    function( geometry, indexGeometry ) {

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
                    }, this
                );
            }, this
        );

        // var canvas = this.canvas;
        // this.camera.update( timing.frameTime );
        //
        // this.useHardwareInstancing = this.instanceCheck && this.instanceCheck.checked;
        //
        // this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
        //
        // if ( this.monkeyIndexCount ) {
        //     var shader = this.useHardwareInstancing ? this.instancedShader : this.defaultShader;
        //     this.gl.useProgram( shader.program );
        //
        //     this.gl.uniform3f( shader.uniform.ambient, 0.1, 0.1, 0.1 );
        //     this.gl.uniformMatrix4fv( shader.uniform.viewMat, false, this.camera.getViewMat( ) );
        //     this.gl.uniformMatrix4fv( shader.uniform.modelMat, false, modelMat );
        //     this.gl.uniformMatrix4fv( shader.uniform.projectionMat, false, this.projectionMat );
        //
        //     this.light.bindUniforms( this.gl, shader.uniform, 1 );
        //
        //     this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, this.monkeyIndexBuffer );
        //
        //     this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.monkeyVertexBuffer );
        //     this.gl.enableVertexAttribArray( shader.attribute.position );
        //     this.gl.vertexAttribPointer( shader.attribute.position, 3, this.gl.FLOAT, false, 12, 0 );
        //
        //     this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.monkeyNormalBuffer );
        //     this.gl.enableVertexAttribArray( shader.attribute.normal );
        //     this.gl.vertexAttribPointer( shader.attribute.normal, 3, this.gl.FLOAT, false, 12, 0 );
        //
        //     if( this.useHardwareInstancing && this.instanceExt ) {
        //         this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.monkeyOffsetBuffer );
        //         this.gl.enableVertexAttribArray( shader.attribute.offset );
        //         this.gl.vertexAttribPointer( shader.attribute.offset, 3, this.gl.FLOAT, false, 12, 0 );
        //         this.instanceExt.vertexAttribDivisorANGLE( shader.attribute.offset, 1 );
        //
        //         this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.monkeyColorBuffer );
        //         this.gl.enableVertexAttribArray( shader.attribute.color );
        //         this.gl.vertexAttribPointer( shader.attribute.color, 3, this.gl.FLOAT, false, 12, 0 );
        //         this.instanceExt.vertexAttribDivisorANGLE( shader.attribute.color, 1 );
        //
        //         this.instanceExt.drawElementsInstancedANGLE( this.gl.TRIANGLES, this.monkeyIndexCount, this.gl.UNSIGNED_SHORT, 0, this.monkeyInstanceCount );
        //
        //         this.instanceExt.vertexAttribDivisorANGLE( shader.attribute.offset, 0 );
        //         this.instanceExt.vertexAttribDivisorANGLE( shader.attribute.color, 0 );
        //     } else {
        //         var x, y, z;
        //         var r, g, b;
        //         for( var i = 0; i < this.monkeyInstanceCount; ++i ) {
        //             x = this.monkeyOffsets[i*3];
        //             y = this.monkeyOffsets[i*3+1];
        //             z = this.monkeyOffsets[i*3+2];
        //
        //             r = this.monkeyColors[i*3];
        //             g = this.monkeyColors[i*3+1];
        //             b = this.monkeyColors[i*3+2];
        //
        //             this.gl.uniform3f( shader.uniform.offset, x, y, z );
        //             this.gl.uniform3f( shader.uniform.color, r, g, b );
        //             this.gl.drawElements( this.gl.TRIANGLES, this.monkeyIndexCount, this.gl.UNSIGNED_SHORT, 0 );
        //         }
        //     }
        // }

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

                context = canvas.getContext( names[ i ] );

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

// require( [
//     "util/this.gl-context-helper",
//     "util/camera",
//     "light",
//     "util/mesh-utils",
//     "util/this.gl-util",
//     "util/this.gl-matrix-min",
//     "js/util/game-shim.js",
//     "js/util/Stats.js"
// ], function( GLContextHelper, Camera, Light, MeshUtils, GLUtil ) {
//     "use strict";
//
//     // Shader
//     var defaultVS = [
//         Light.DirectionalLight.vertexFunction,
//
//         "attribute vec3 position;",
//         "attribute vec3 normal;",
//
//         "uniform vec3 offset;",
//         "uniform vec3 color;",
//
//         "uniform mat4 viewMat;",
//         "uniform mat4 modelMat;",
//         "uniform mat4 projectionMat;",
//
//         "varying vec3 vNormal;",
//         "varying vec4 vColor;",
//
//         "void main( void ) {",
//         "   vec4 worldPosition =  modelMat * vec4( position, 1.0 );",
//         "   worldPosition += vec4( offset, 0.0 );",
//         "   mat3 normalMat = mat3( modelMat );",
//         "   vNormal = normal * normalMat;",
//         "   vColor = vec4( color, 1.0 );",
//         "   setupLight( worldPosition.xyz );",
//         "   gl_Position = projectionMat * viewMat * worldPosition;",
//         "}"
//     ].join( "\n" );
//
//     var instancedVS = [
//         Light.DirectionalLight.vertexFunction,
//
//         "attribute vec3 position;",
//         "attribute vec3 normal;",
//         "attribute vec3 offset;",
//         "attribute vec3 color;",
//
//         "uniform mat4 viewMat;",
//         "uniform mat4 modelMat;",
//         "uniform mat4 projectionMat;",
//
//         "varying vec3 vNormal;",
//         "varying vec4 vColor;",
//
//         "void main( void ) {",
//         "   vec4 worldPosition =  modelMat * vec4( position, 1.0 );",
//         "   worldPosition += vec4( offset, 0.0 );",
//         "   mat3 normalMat = mat3( modelMat );",
//         "   vNormal = normal * normalMat;",
//         "   vColor = vec4( color, 1.0 );",
//         "   setupLight( worldPosition.xyz );",
//         "   gl_Position = projectionMat * viewMat * worldPosition;",
//         "}"
//     ].join( "\n" );
//
//     var defaultFS = [
//         "precision mediump float;",
//
//         Light.DirectionalLight.fragmentFunction,
//
//         "uniform vec3 ambient;",
//         "varying vec3 vNormal;",
//         "varying vec4 vColor;",
//
//         "void main( void ) {",
//         "   vec3 lightValue = computeLight( vNormal, 0.5 );",
//         "   vec4 diffuseColor = vColor;",
//         "   vec3 finalColor = diffuseColor.rgb * ambient;",
//         "   finalColor += diffuseColor.rgb * lightValue;",
//         "   gl_FragColor = vec4( finalColor, diffuseColor.a );",
//         "}"
//     ].join( "\n" );
//
//
//     Renderer.prototype._buildMonkey = function( this.gl ) {
//         this.monkeyVertexBuffer = null;
//         this.monkeyNormalBuffer = null;
//         this.monkeyIndexBuffer = null;
//
//         this.monkeyIndexCount = 0;
//
//         var self = this;
//         var jsonXhr = new XMLHttpRequest( );
//         jsonXhr.open( 'GET', "root/models/suzanne.json", true );
//         jsonXhr.onload = function( ) {
//             var data = JSON.parse( this.responseText );
//
//             var positionData = new Float32Array( data.buffer );
//             var indexData = new Uint16Array( data.indices );
//             var normalData = MeshUtils.generateNormals( positionData, 3, 0, positionData.length/3, indexData );
//
//             self.monkeyIndexCount = indexData.length;
//
//             self.monkeyVertexBuffer = this.gl.createBuffer( );
//             this.gl.bindBuffer( this.gl.ARRAY_BUFFER, self.monkeyVertexBuffer );
//             this.gl.bufferData( this.gl.ARRAY_BUFFER, positionData, this.gl.STATIC_DRAW );
//
//             self.monkeyNormalBuffer = this.gl.createBuffer( );
//             this.gl.bindBuffer( this.gl.ARRAY_BUFFER, self.monkeyNormalBuffer );
//             this.gl.bufferData( this.gl.ARRAY_BUFFER, normalData, this.gl.STATIC_DRAW );
//
//             self.monkeyIndexBuffer = this.gl.createBuffer( );
//             this.gl.bindBuffer( this.gl.ELEMENT_ARRAY_BUFFER, self.monkeyIndexBuffer );
//             this.gl.bufferData( this.gl.ELEMENT_ARRAY_BUFFER, indexData, this.gl.STATIC_DRAW );
//         };
//         jsonXhr.send( null );
//     };
//
//     Renderer.prototype._buildInstances = function( this.gl, monkeyCubeSize ) {
//         var monkeySize = 3.0;
//         var hmcs = monkeyCubeSize / 2.0;
//
//         this.monkeyInstanceCount = monkeyCubeSize * monkeyCubeSize * monkeyCubeSize;
//
//         var offsetData = new Float32Array( this.monkeyInstanceCount * 3 );
//         var colorData = new Float32Array( this.monkeyInstanceCount * 3 );
//
//         var i = 0;
//         for( var z = 0; z < monkeyCubeSize; ++z ) {
//             for( var y = 0; y < monkeyCubeSize; ++y ) {
//                 for( var x = 0; x < monkeyCubeSize; ++x ) {
//                     offsetData[i] = ( x-hmcs ) * monkeySize;
//                     offsetData[i+1] = ( y-hmcs ) * monkeySize;
//                     offsetData[i+2] = ( z-hmcs ) * monkeySize;
//
//                     colorData[i] = x / monkeyCubeSize;
//                     colorData[i+1] = y / monkeyCubeSize;
//                     colorData[i+2] = z / monkeyCubeSize;
//
//                     i += 3;
//                 }
//             }
//         }
//
//         this.monkeyOffsetBuffer = this.gl.createBuffer( );
//         this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.monkeyOffsetBuffer );
//         this.gl.bufferData( this.gl.ARRAY_BUFFER, offsetData, this.gl.STATIC_DRAW );
//
//         this.monkeyColorBuffer = this.gl.createBuffer( );
//         this.gl.bindBuffer( this.gl.ARRAY_BUFFER, this.monkeyColorBuffer );
//         this.gl.bufferData( this.gl.ARRAY_BUFFER, colorData, this.gl.STATIC_DRAW );
//
//         this.monkeyOffsets = offsetData;
//         this.monkeyColors = colorData;
//     };
//
//     // Setup the canvas and GL context, initialize the scene
//     var canvas = document.getElementById( "webgl-canvas" );
//     var contextHelper = new GLContextHelper( canvas, document.getElementById( "content-frame" ) );
//     var renderer = new Renderer( contextHelper.this.gl, canvas );
//
//     var fullscreenBtn = document.getElementById( "fullscreen" );
//     if( contextHelper.fullscreenSupported ) {
//         fullscreenBtn.addEventListener( "click", function( ) {
//             contextHelper.toggleFullscreen( );
//         } );
//     } else {
//         fullscreenBtn.parentElement.removeChild( fullscreenBtn );
//     }
//
//     var stats = new Stats( );
//     document.getElementById( "controls-container" ).appendChild( stats.domElement );
//
//     // Get the render loop going
//     contextHelper.start( renderer, stats );
// } );
