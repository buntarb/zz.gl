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

/**
* Bootstrap module method.
*/
zz.gl.bootstrap = function( ){

    var canvas = document.createElement( 'canvas' );
    canvas.width  = 1200;
    canvas.height = 600;
    document.body.appendChild( canvas );

    var renderer = new zz.gl.Renderer( canvas );

    zz.gl.addOrbitControl( renderer.defaultCamera, canvas );
    
    // zz.gl.testSimplePointWithCustomGeometry( renderer );
    // zz.gl.testSimpleLineWithCustomGeometry( renderer );
    // zz.gl.testPointsGeometry( renderer );
    // zz.gl.testBrokenLinesGeometry( renderer );
    zz.gl.testCurve( renderer );

    function render( ){

        renderer.render( );
        goog.global.requestAnimationFrame( render );
    }

    render( );
};

//------------------------------------Debugging functions-----------------------------------------------------------

goog.require( 'zz.gl.OrbitControl' );
goog.require( 'zz.gl.Geometry' );
goog.require( 'zz.gl.Points' );
goog.require( 'zz.gl.BrokenLines' );

zz.gl.addOrbitControl = function( camera, canvas ){

    var orbitControl = new zz.gl.OrbitControl( camera, canvas );
    return orbitControl;
}

zz.gl.testCurve = function( renderer ){

    /**
     *
     * @type {zz.gl.ISceneWorker}
     */
    var sceneWorker = {

        'points_': new Float32Array( [

            -0.5, 0.5, 0.0,
            0.5, 0.5, 0.0,
            0.5, -0.5, 0.0,

            0.5, -0.5, 0.0,
            -0.5, -0.5, 0.0,
            -0.5, 0.5, 0.0
        ] ),

        'geometries': [ new zz.gl.Geometry( ) ],

        getGeometries: function ( ) {

            return this[ 'geometries' ];
        }
    };

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

            10.0, 10.0, 10.0,
            10.0, 10.0, 10.0,
            10.0, 10.0, 10.0,
            10.0, 10.0, 10.0,
            10.0, 10.0, 10.0,
            10.0, 10.0, 10.0
        ] ) );

    var countPerElement = 3;
    var bytesBerElement = geometry.getParameterData( zz.gl.enums.GeometryParameters.NORMAL ).BYTES_PER_ELEMENT;

        geometry.setParameterCountPerElement( param, countPerElement );
    geometry.setParameterStride( param, bytesBerElement * countPerElement );
    geometry.setParameterOffset( param, bytesBerElement * 0 );

    geometry.setDrawMethod( zz.gl.enums.DrawMethod.DRAW_ARRAYS );
    geometry.setPrimitive( zz.gl.enums.Primitives.TRIANGLES );
    geometry.setFirst( 0 );
    geometry.setCount( geometry.getParameterData( zz.gl.enums.GeometryParameters.NORMAL ).length / countPerElement );

    renderer.addSceneWorker( sceneWorker );
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