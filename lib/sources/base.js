/**
* @fileoverview Provide zz.gl base object.
* @license Apache-2.0
* @author buntarb@gmail.com (Artem Lytvynov)
*/

goog.provide( 'zz.gl' );

goog.require( 'zz.gl.Renderer' );

/**
* Base namespace for zz.gl module.
* @const
*/
zz.gl = zz.gl || { };

var orbitControl;

/**
* Bootstrap module method.
*/
zz.gl.bootstrap = function( ){

    var canvas = document.createElement( 'canvas' );
    canvas.width  = 1200;
    canvas.height = 600;
    document.body.appendChild( canvas );

    var renderer = new zz.gl.Renderer( canvas );

    orbitControl = zz.gl.addOrbitControl( renderer.defaultCamera, canvas );
    
    zz.gl.testSimplePointWithCustomGeometry( renderer );
    zz.gl.testSimpleLineWithCustomGeometry( renderer );
    zz.gl.testPointsGeometry( renderer );
    zz.gl.testBrokenLinesGeometry( renderer );
    zz.gl.testCurveLines( renderer );

    function render( ){

        renderer.render( undefined, orbitControl.isMouseDown );
        // renderer.render( undefined, true );
        // goog.global.requestAnimationFrame( render );
        // goog.Timer.callOnce( render, 10 );
        orbitControl.isMouseDown? goog.Timer.callOnce( render, 10 ): goog.Timer.callOnce( render, 100 );
    }

    render( );
    // goog.Timer.callOnce( render, 1000 );
};

//------------------------------------Debugging functions-----------------------------------------------------------

goog.require( 'zz.gl.OrbitControl' );
goog.require( 'zz.gl.Geometry' );
goog.require( 'zz.gl.Points' );
goog.require( 'zz.gl.BrokenLines' );
goog.require( 'zz.gl.CurveLines' );

zz.gl.addOrbitControl = function( camera, canvas ){

    var orbitControl = new zz.gl.OrbitControl( camera, canvas );
    return orbitControl;
}

zz.gl.testCurveLines = function( renderer ){

    /**
     *
     * @type {zz.gl.CurveLines}
     */
    var sceneWorker = zz.gl.CurveLines.getInstance( );
    renderer.addSceneWorker( sceneWorker );

    var meshParams = { };

    // meshParams[ sceneWorker.DIM_X ] = [ 1.0, 0.0, 0.5     ,1.0];
    meshParams[ sceneWorker.DIM_X ] = [ -1.0, -0.5, 0.0, -1.0 ];
    meshParams[ sceneWorker.DIM_Y ] = [ 0.0, 1.0, 0.0       ,0.5];
    // meshParams[ sceneWorker.DIM_Y ] = [ 0.0, 1.0];
    // meshParams[ sceneWorker.DIM_Y ] = [ 0.0, 0.5, 1.0, 0.0 ];
    meshParams[ sceneWorker.DIM_Z ] = [ 1.0, 1.0, 0.0       ,0.5];
    meshParams[ sceneWorker.DIM_COLOR ] = [ 0xFF0000, 0x00FF00       , 0x0000FF , 0xFFFF00 ];
    // meshParams[ sceneWorker.DIM_COLOR ] = [ 0xFF0000, 0x00FF00, 0x0000FF ];
    // meshParams[ sceneWorker.DIM_COLOR ] = [ 0xFF0000, 0x0000FF ];
    // meshParams[ sceneWorker.DIM_COLOR ] = [ 0xFF0000 ];

    var config = undefined;
    sceneWorker.create( meshParams, config );

    for( var t = 1; t <= 10; t++ ){

        meshParams = { };
        var knotsCount = 300;
        var xs = [ ];
        var ys = [ ];
        var zs = [ ];
        for( var i = 0; i < knotsCount; i++ ){

            var x = Math.random( ) * ( i % 2 == 0? 1: -1 );
            var y = -Math.cos( x ) * ( Math.random( ) + Math.random( ) ) * x - Math.random( );
            var z = Math.sin( y ) * ( Math.random( ) + Math.random( ) ) * y - Math.random( );

            // xs.push( Math.random( ) );
            // ys.push( Math.random( ) );
            // zs.push( Math.random( ) );

            xs.push( x );
            ys.push( y );
            zs.push( z );
        }
        meshParams[ sceneWorker.DIM_X ] = xs;
        meshParams[ sceneWorker.DIM_Y ] = ys;
        meshParams[ sceneWorker.DIM_Z ] = zs;
        meshParams[ sceneWorker.DIM_COLOR ] = [ 0x00FFFF ];
        sceneWorker.create( meshParams, config );
    }
}

zz.gl.testSimplePointWithCustomGeometry = function( renderer ){

    /**
     *
     * @type {zz.gl.ISceneWorker}
     */
    var sceneWorker = {

        'points_': new Float32Array( [ 0.0, 0.0, 0.0, 30.0, 1.0, 0.0, 0.0 ] ),

        'geometries': [ new zz.gl.Geometry( ) ],

        getGeometries: function ( ) {

            return this[ 'geometries' ];
        }
    };

    // console.log(sceneWorker);

    // var geometry = sceneWorker[ 'getGeometries' ]( )[ 0 ];
    var geometry = sceneWorker.getGeometries( )[ 0 ];

    var param = zz.gl.enums.GeometryParameters.POSITION;
    geometry.setParameter( param, { } );
    geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
    geometry.setParameterData( param, sceneWorker[ 'points_' ] );
    geometry.setParameterCountPerElement( param, 3 );
    geometry.setParameterStride( param, sceneWorker[ 'points_' ].BYTES_PER_ELEMENT * 7 );
    geometry.setParameterOffset( param, sceneWorker[ 'points_' ].BYTES_PER_ELEMENT * 0 );

    param = zz.gl.enums.GeometryParameters.COLOR;
    geometry.setParameter( param, { } );
    geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
    geometry.setParameterData( param, sceneWorker[ 'points_' ] );
    geometry.setParameterCountPerElement( param, 3 );
    geometry.setParameterStride( param, sceneWorker[ 'points_' ].BYTES_PER_ELEMENT * 7 );
    geometry.setParameterOffset( param, sceneWorker[ 'points_' ].BYTES_PER_ELEMENT * 4 );

    param = zz.gl.enums.GeometryParameters.POINTSIZE;
    geometry.setParameter( param, { } );
    geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
    geometry.setParameterData( param, sceneWorker[ 'points_' ] );
    geometry.setParameterCountPerElement( param, 1 );
    geometry.setParameterStride( param, sceneWorker[ 'points_' ].BYTES_PER_ELEMENT * 7 );
    geometry.setParameterOffset( param, sceneWorker[ 'points_' ].BYTES_PER_ELEMENT * 3 );

    geometry.setDrawMethod( zz.gl.enums.DrawMethod.DRAW_ARRAYS );
    geometry.setPrimitive( zz.gl.enums.Primitives.POINTS );
    geometry.setFirst( 0 );
    geometry.setCount( 1 );

    renderer.addSceneWorker( sceneWorker );
}

zz.gl.testSimpleLineWithCustomGeometry = function( renderer ){

    /**
     *
     * @type {zz.gl.ISceneWorker}
     */
    var sceneWorker = {

        'lines_': new Float32Array( [ // a vertex and its color in each row

            -1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            1.0, 0.0, 0.0, 0.0, 0.0, 1.0
        ] ),

        'geometries': [ new zz.gl.Geometry( ) ],

        getGeometries: function ( ) {

            return this[ 'geometries' ];
        }
    };

    // console.log(sceneWorker);

    // var geometry = sceneWorker[ 'getGeometries' ]( )[ 0 ];
    var geometry = sceneWorker.getGeometries( )[ 0 ];

    var param = zz.gl.enums.GeometryParameters.POSITION;
    geometry.setParameter( param, { } );
    geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
    geometry.setParameterData( param, sceneWorker[ 'lines_' ] );
    geometry.setParameterCountPerElement( param, 3 );
    geometry.setParameterStride( param, sceneWorker[ 'lines_' ].BYTES_PER_ELEMENT * 6 );
    geometry.setParameterOffset( param, sceneWorker[ 'lines_' ].BYTES_PER_ELEMENT * 0 );

    param = zz.gl.enums.GeometryParameters.COLOR;
    geometry.setParameter( param, { } );
    geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
    geometry.setParameterData( param, sceneWorker[ 'lines_' ] );
    geometry.setParameterCountPerElement( param, 3 );
    geometry.setParameterStride( param, sceneWorker[ 'lines_' ].BYTES_PER_ELEMENT * 6 );
    geometry.setParameterOffset( param, sceneWorker[ 'lines_' ].BYTES_PER_ELEMENT * 3 );

    geometry.setDrawMethod( zz.gl.enums.DrawMethod.DRAW_ARRAYS );
    geometry.setPrimitive( zz.gl.enums.Primitives.LINES );
    geometry.setFirst( 0 );
    geometry.setCount( 2 ); // two points

    renderer.addSceneWorker( sceneWorker );
}

zz.gl.testPointsGeometry = function( renderer ){

    /**
     *
     * @type {zz.gl.Points}
     */
    var sceneWorker = zz.gl.Points.getInstance( );
    renderer.addSceneWorker( sceneWorker );

    sceneWorker.setExpectedCount( 2 );

    var meshParams = { };
    meshParams[ sceneWorker.DIM_X ] = [ 0.0, 0.5, 0.75 ];
    meshParams[ sceneWorker.DIM_Y ] = [ 0.0, 0.5 ];
    // meshParams[ sceneWorker.DIM_Z ] = 0.0;
    meshParams[ sceneWorker.DIM_COLOR ] = [ 0x0000FF, 0xFF0000 ];
    meshParams[ sceneWorker.DIM_SIZE ] = 40;

    var config = undefined;
    sceneWorker.create( meshParams, config );

    for( var i = 1; i <= 10; i++ ){

        meshParams[ sceneWorker.DIM_X ] = Math.random( );
        meshParams[ sceneWorker.DIM_Y ] = Math.random( );
        meshParams[ sceneWorker.DIM_Z ] = Math.random( );
        meshParams[ sceneWorker.DIM_COLOR ] = 0x00FF00;
        meshParams[ sceneWorker.DIM_SIZE ] = 2 * i;

        sceneWorker.create( meshParams, config );
    }

    var data = [

        -0.75, -0.65,
        10,
        0xFFFF00,

        -0.55, -0.45,
        20,
        0xFF00FF
    ];

    meshParams = { };
    meshParams[ sceneWorker.DIM_X ] =
        meshParams[ sceneWorker.DIM_Y ] =
            meshParams[ sceneWorker.DIM_COLOR ] =
                meshParams[ sceneWorker.DIM_SIZE ] = data;
    meshParams[ sceneWorker.STRIDE_DIM_X ] =
        meshParams[ sceneWorker.STRIDE_DIM_Y ] =
            meshParams[ sceneWorker.STRIDE_DIM_COLOR ] =
                meshParams[ sceneWorker.STRIDE_DIM_SIZE ] = 4;
    meshParams[ sceneWorker.OFFSET_DIM_Y ] = 1;
    meshParams[ sceneWorker.OFFSET_DIM_COLOR ] = 3;
    meshParams[ sceneWorker.OFFSET_DIM_SIZE ] = 2;

    // console.log(meshParams);

    sceneWorker.create( meshParams );
}

zz.gl.testBrokenLinesGeometry = function( renderer ){

    /**
     *
     * @type {zz.gl.BrokenLines}
     */
    var sceneWorker = zz.gl.BrokenLines.getInstance( );
    renderer.addSceneWorker( sceneWorker );

    sceneWorker.setExpectedCount( 2 );

    var meshParams = { };
    meshParams[ sceneWorker.DIM_X ] = [ 0.0, 0.5, 0.75 ];
    meshParams[ sceneWorker.DIM_Y ] = [ 0.0, 0.5 ];
    meshParams[ sceneWorker.DIM_COLOR ] = [ 0x0000FF, 0xFF0000 ];

    var config = undefined;
    sceneWorker.create( meshParams, config );

    meshParams[ sceneWorker.DIM_X ] = [ ];
    meshParams[ sceneWorker.DIM_Y ] = [ ];
    meshParams[ sceneWorker.DIM_Z ] = [ ];
    meshParams[ sceneWorker.DIM_COLOR ] = [ ];
    for( var i = 1; i <= 10; i++ ){

        meshParams[ sceneWorker.DIM_X ].push( Math.random( ) );
        meshParams[ sceneWorker.DIM_Y ].push( Math.random( ) );
        meshParams[ sceneWorker.DIM_Z ].push( Math.random( ) );
        meshParams[ sceneWorker.DIM_COLOR ].push( 0xFFFF00 );

        // sceneWorker.create( meshParams, config );
    }
    sceneWorker.create( meshParams, config );

    var data = [

        -0.95, -0.35,
        0xFFFF00,

        -0.15, -0.45,
        0xFF00FF,

        -0.75, -0.55,
        0x00FF00
    ];

    meshParams = { };
    meshParams[ sceneWorker.DIM_X ] =
        meshParams[ sceneWorker.DIM_Y ] =
            meshParams[ sceneWorker.DIM_COLOR ] = data;
    meshParams[ sceneWorker.STRIDE_DIM_X ] =
        meshParams[ sceneWorker.STRIDE_DIM_Y ] =
            meshParams[ sceneWorker.STRIDE_DIM_COLOR ] = 3;
    meshParams[ sceneWorker.OFFSET_DIM_Y ] = 1;
    meshParams[ sceneWorker.OFFSET_DIM_COLOR ] = 2;

    sceneWorker.create( meshParams );
}

goog.exportSymbol( 'zz.gl.bootstrap', zz.gl.bootstrap );