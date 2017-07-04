goog.provide( 'zz.gl.ShaderProgram' );

/**
 * Wrapper for GLSL program.
 * @param {Object} gl GL context.
 * @param {Object} opt_programGLSL GLSL program object. Is optional if there are two last parameters. Has main priority.
 * @param {string} opt_vShaderSource Vertex shader source code. Is optional if there is opt_programGLSL parameter.
 * @param {string} opt_fShaderSource Fragment shader source code. Is optional if there is opt_programGLSL parameter.
 */
zz.gl.ShaderProgram = class {

    constructor( gl, opt_programGLSL, opt_vShaderSource, opt_fShaderSource ) {

        if( !gl ){

            throw 'gl parameter is mandatory.';
        }

        var program = null;

        if( opt_programGLSL ){

            program = opt_programGLSL;

        }else if( opt_vShaderSource && opt_fShaderSource ){

            program = zz.gl.ShaderProgram.createProgramGLSL( gl, opt_vShaderSource, opt_fShaderSource );
            if( !program ){

                throw 'Cannot create GLSL program.';
            }
        }else{

            throw 'opt_vShaderSource and opt_fShaderSource parameters are mandatory if opt_programGLSL is not defined.';
        }

        this.initWrapper_( gl, program );
    }

    /**
     * Create the GLSL program object
     * @param {Object} gl GL context
     * @param {string} vShader Vertex shader source code
     * @param {string} fShader Fragment shader source code
     * @return {Object|null} created program object, or null if the creation has failed
     */
    static createProgramGLSL( gl, vShader, fShader ) {

        // Create shader object
        var vertexShader = zz.gl.ShaderProgram.createShader( gl, gl.VERTEX_SHADER, vShader );
        var fragmentShader = zz.gl.ShaderProgram.createShader( gl, gl.FRAGMENT_SHADER, fShader );

        if ( !vertexShader || !fragmentShader ) {

            return null;
        }

        // Create a program object
        var program = gl.createProgram( );
        if ( !program ) {

            return null;
        }

        // Attach the shader objects
        gl.attachShader( program, vertexShader );
        gl.attachShader( program, fragmentShader );

        // Link the program object
        gl.linkProgram( program );

        // Check the result of linking
        var linked = gl.getProgramParameter( program, gl.LINK_STATUS );
        if ( !linked ) {

            var error = gl.getProgramInfoLog( program );
            console.log('Failed to link program: ' + error);

            gl.deleteProgram( program );
            gl.deleteShader( fragmentShader );
            gl.deleteShader( vertexShader );

            return null;
        }

        return program;
    }

    /**
     * Create a shader object
     * @param {Object} gl GL context
     * @param type The type of the shader object to be created: gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @param {string} source Shader program source code
     * @return {Object|null} Created shader object, or null if the creation has failed.
     */
    static createShader( gl, type, source ) {

        // Create shader object
        var shader = gl.createShader( type );
        if ( shader == null ) {

            console.log('Unable to create shader');
            return null;
        }

        // Set the shader program
        gl.shaderSource( shader, source );

        // Compile the shader
        gl.compileShader( shader );

        // Check the result of compilation
        var compiled = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
        if ( !compiled ) {

            var error = gl.getShaderInfoLog( shader );
            console.log( 'Failed to compile shader: ' + error );

            gl.deleteShader( shader );
            return null;
        }

        return shader;
    }

    /**
     * Create a shader object
     * @param {Object} gl GL context
     * @param {Object} program GLSL program object.
     */
    initWrapper_( gl, program ){

        var i;
        var attrib;
        var uniform;
        var count;
        var name;

        this.program = program;
        this.attributes = { };
        this.uniforms = { };

        count = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES );

        for ( i = 0; i < count; i++ ) {

            attrib = gl.getActiveAttrib( program, i );
            this.attributes[ attrib.name ] = gl.getAttribLocation( program, attrib.name );
            gl.enableVertexAttribArray( this.attributes[ attrib.name ] );
        }

        count = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS );

        for ( i = 0; i < count; i++ ) {

            uniform = gl.getActiveUniform( program, i );
            name = uniform.name.replace( "[0]", "" );
            this.uniforms[ name ] = gl.getUniformLocation( program, name );
        }
    }
};