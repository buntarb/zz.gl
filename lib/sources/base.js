/**
* @fileoverview Provide zz.gl base object.
* @license Apache-2.0
* @author buntarb@gmail.com (Artem Lytvynov)
*/

goog.provide( 'zz.gl' );

goog.require( 'goog.Timer' );
goog.require( 'zz.gl.Renderer' );

/**
* Base namespace for zz.gl module.
* @const
*/
zz.gl = zz.gl || { };

/**
* Bootstrap module method.
*/
zz.gl.bootstrap = function( ){

    var div = [ ];
    var span = [ ];
    var canvas = [ ];
    var canvas1 = [ ];
    var renderer = [ ];
    var elapsedTime = [ ];
    var frameCount = [ ];
    var lastTime = [ ];
    var drawScene = [ ];
    var fps = [ ];
    var pixels = [ ];
    var ctx2d = [ ];

    var i;
    var a = 1;
    var b = new Float32Array( 1 );
        b[ 0 ] = Math.fround(1);
    var c = new Float32Array( 1 );
        c[ 0 ] = Math.fround(1);

    var Ta = Date.now( );
    for( i = 0; i < 1000000; i++ ){
        a = a + 1;
    }
    console.log( Date.now( ) - Ta, a );

    var Tb = Date.now( );
    for( i = 0; i < 1000000; i++ ){
        b[ 0 ] = Math.fround(b[ 0 ] + c[ 0 ]);
    }
    console.log( Date.now( ) - Tb, b );

    // for( var i = 0; i < 17; i++ ){
    //
    //     goog.Timer.callOnce( function( i ){
    //         div[ i ] = document.createElement( 'div' );
    //         span[ i ] = document.createElement( 'span' );
    //         canvas[ i ] = document.createElement( 'canvas' );
    //         canvas1[ i ] = document.createElement( 'canvas' );
    //
    //         document.body.appendChild( div[ i ] );
    //         div[ i ].appendChild( canvas[ i ] );
    //         div[ i ].appendChild( canvas1[ i ] );
    //         div[ i ].appendChild( span[ i ] );
    //         canvas[ i ].width  = 300;
    //         canvas[ i ].height = 300;
    //         canvas1[ i ].width  = 300;
    //         canvas1[ i ].height = 300;
    //         canvas1[ i ].style.display = 'none';
    //         renderer[ i ] = new zz.gl.Renderer( canvas[ i ] );
    //         zz.gl.testCurve( renderer[ i ] );
    //
    //         elapsedTime[ i ] = 0;
    //         frameCount[ i ] = 0;
    //         lastTime[ i ] = 0;
    //         pixels[ i ] = new Uint8Array( 300 * 300 * 4 );
    //         renderer[ i ].render( );
    //         renderer[ i ].gl.readPixels( 0, 0, 300, 300, renderer[ i ].gl.RGBA, renderer[ i ].gl.UNSIGNED_BYTE, pixels[ i ] );
    //         //renderer[ i ].gl.getExtension( 'WEBGL_lose_context' ).loseContext( );
    //
    //         canvas[ i ].addEventListener( "webglcontextlost", function( i, event ){
    //
    //             event.preventDefault( );
    //             // console.log( pixels[ i ] );
    //             canvas[ i ].style.display = 'none';
    //             canvas1[ i ].style.display = 'block';
    //             ctx2d[ i ] = canvas1[ i ].getContext( '2d' );
    //             var imgData = ctx2d[ i ].createImageData( 300,300 );
    //             for( var c = 0; c < pixels[ i ].length; c += 4 ){
    //
    //                 imgData.data[c]   = pixels[ i ][ pixels[ i ].length - c ];   //red
    //                 imgData.data[c+1] = pixels[ i ][ pixels[ i ].length - c + 1 ]; //green
    //                 imgData.data[c+2] = pixels[ i ][ pixels[ i ].length - c + 2 ]; //blue
    //                 imgData.data[c+3] = pixels[ i ][ pixels[ i ].length - c + 3 ]; //alpha
    //             }
    //             ctx2d[ i ].putImageData( imgData, 0, 0 );
    //
    //         }.bind( undefined, i ), false);
    //
    //     }.bind( undefined, i ), 0 );
    // }
};

//------------------------------------Debugging functions-----------------------------------------------------------

goog.require( 'zz.gl.OrbitControl' );
goog.require( 'zz.gl.Geometry' );
goog.require( 'zz.gl.Points' );
goog.require( 'zz.gl.BrokenLines' );

zz.gl.addOrbitControl = function( camera, canvas ){

    var orbitControl = new zz.gl.OrbitControl( camera, canvas );
    return orbitControl;
};

zz.gl.testCurve = function( renderer ){

    /**
     *
     * @type {zz.gl.ISceneWorker}
     */
    var sceneWorker = {

        'points_': new Float32Array( [

            -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, -1.0, 0.0,

            1.0, -1.0, 0.0,
            -1.0, -1.0, 0.0,
            -1.0, 1.0, 0.0
        ] ),

        'geometries': [ new zz.gl.Geometry( ) ],

        getGeometries: function ( ) {

            return this[ 'geometries' ];
        }
    };

    var nSquare = 1;
    var points = new Float32Array( sceneWorker[ 'points_' ].length * nSquare );
    for( var s = 0; s < nSquare; s++ ){

        points.set( sceneWorker[ 'points_' ], sceneWorker[ 'points_' ].length * s );
    }
    sceneWorker[ 'points_' ] = points;

    var geometry = sceneWorker.getGeometries( )[ 0 ];

    var param = zz.gl.enums.GeometryParameters.POSITION;
    geometry.setParameter( param, { } );
    geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
    geometry.setParameterData( param, sceneWorker[ 'points_' ] );
    geometry.setParameterCountPerElement( param, 3 );
    geometry.setParameterStride( param, sceneWorker[ 'points_' ].BYTES_PER_ELEMENT * 3 );
    geometry.setParameterOffset( param, sceneWorker[ 'points_' ].BYTES_PER_ELEMENT * 0 );

    // Suppose it is some knots ;-)
    param = zz.gl.enums.GeometryParameters.NORMAL;
    geometry.setParameter( param, { } );
    geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
    geometry.setParameterData( param,
        new Float32Array( [

            -1.0, 0.0, 0.0,
            -0.5, 0.0, 0.0,
            -0.25, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.25, 0.0, 0.0,
            0.5, 0.0, 0.0
        ] ) );

    var countPerElement = 3;
    var bytesBerElement = geometry.getParameterData( zz.gl.enums.GeometryParameters.NORMAL ).BYTES_PER_ELEMENT;

    geometry.setParameterCountPerElement( param, countPerElement );
    geometry.setParameterStride( param, bytesBerElement * countPerElement );
    geometry.setParameterOffset( param, bytesBerElement * 0 );

    geometry.setDrawMethod( zz.gl.enums.DrawMethod.DRAW_ARRAYS );
    geometry.setPrimitive( zz.gl.enums.Primitives.TRIANGLES );
    geometry.setFirst( 0 );
    geometry.setCount( geometry.getParameterData( zz.gl.enums.GeometryParameters.POSITION ).length / countPerElement );

    renderer.addSceneWorker( sceneWorker );
};

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
    meshParams[ sceneWorker.X ] = 0.0;
    meshParams[ sceneWorker.Y ] = 0.0;
    meshParams[ sceneWorker.Z ] = 0.0;
    meshParams[ sceneWorker.COLOR_HEX ] = 0x0000FF;
    meshParams[ sceneWorker.POINT_SIZE ] = 40;

    var config = { };

    // config = sceneWorker.getDefaultParamsConfig( );
    // config[ sceneWorker.POINT_SIZE ] = 's';
    // meshParams[ 's' ] = 60;
    //
    // sceneWorker.setCurrentParamsConfig( config );

    config = undefined;

    // sceneWorker.createOne( );
    // sceneWorker.createOne( {} );
    // sceneWorker.createOne( {'pointSize': 50} );
    sceneWorker.createOne( meshParams, config );

    for( var i = 1; i <= 10; i++ ){

        meshParams[ sceneWorker.X ] = Math.random( );
        meshParams[ sceneWorker.Y ] = Math.random( );
        meshParams[ sceneWorker.Z ] = Math.random( );
        meshParams[ sceneWorker.COLOR_HEX ] = 0x00FF00;
        meshParams[ sceneWorker.POINT_SIZE ] = 2 * i;
        // meshParams[ sceneWorker.POINT_SIZE ] = undefined;

        sceneWorker.createOne( meshParams, config );
    }
}

zz.gl.testBrokenLinesGeometry = function( renderer ){

    /**
     *
     * @type {zz.gl.BrokenLines}
     */
    var sceneWorker = zz.gl.BrokenLines.getInstance( );
    renderer.addSceneWorker( sceneWorker );

    var meshParams = { };
    // meshParams[ sceneWorker.VERTICES ] = [
    //
    //     -0.8, -0.8, 0.0,
    //     0.0, 0.0, -1.0,
    //     0.5, 0.3, 0.0,
    //     -1.0, 0.0, 1.0,
    //     1.0, 0.0, 0.0
    // ];
    // meshParams[ sceneWorker.VERTICES ] = [
        meshParams[ 'vertices2D' ] = [

        -1.0, 0.0, //0.0,
        0.0, 1.0, //0.0,
        1.0, 0.0, //0.0
        // 0.5, 0.3, 0.0,
        // -1.0, 0.0, 1.0,
        // 1.0, 0.0, 0.0
    ];
    meshParams[ sceneWorker.COLOR_HEX ] = 0x0000FF;

    sceneWorker.createOne( meshParams );

    var config = undefined;

    // for( var i = 1; i <= 10; i++ ){
    //
    //     meshParams[ sceneWorker.VERTICES ] = [
    //
    //         -Math.random( ), Math.random( ), Math.random( ),
    //         Math.random( ), -Math.random( ), Math.random( ),
    //         Math.random( ), Math.random( ), -Math.random( ),
    //         -Math.random( ), Math.random( ), -Math.random( )
    //     ];
    //     meshParams[ sceneWorker.COLOR_HEX ] = 0x00FF00;
    //
    //     sceneWorker.createOne( meshParams, config );
    // }

    // for( var i = 1; i <= 100; i++ ){
    //
    //     meshParams[ 'vertices2D' ] = [ ];
    //     for( var j = 1; j <= 100; j++ ){
    //
    //         meshParams[ 'vertices2D' ].push( Math.random( ) );
    //     }
    //     meshParams[ sceneWorker.COLOR_HEX ] = 0x00FF00;
    //
    //     sceneWorker.createOne( meshParams, config );
    // }
}

goog.exportSymbol( 'zz.gl.bootstrap', zz.gl.bootstrap );