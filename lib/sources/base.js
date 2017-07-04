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
    zz.gl.testSimplePointWithCustomGeometry( renderer );
    zz.gl.testSimpleLineWithCustomGeometry( renderer );

    function render( ){

        renderer.render( );
        goog.global.requestAnimationFrame( render );
    }

    render( );
};

//------------------------------------Debugging functions-----------------------------------------------------------

goog.require( 'zz.gl.OrbitControl' );
goog.require( 'zz.gl.Geometry' );

zz.gl.addOrbitControl = function( camera, canvas ){

    var orbitControl = new zz.gl.OrbitControl( camera, canvas );
    return orbitControl;
}

zz.gl.testSimplePointWithCustomGeometry = function( renderer ){

    var sceneWorker = {

        'points_': new Float32Array( [ 0.0, 0.0, 0.0, 30.0, 1.0, 0.0, 0.0 ] ),

        'geometries': [ new zz.gl.Geometry( ) ],

        'getGeometries': function ( ) {

            return this[ 'geometries' ];
        }
    };

    // console.log(sceneWorker);

    var geometry = sceneWorker[ 'getGeometries' ]( )[ 0 ];

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

    var sceneWorker = {

        'lines_': new Float32Array( [ // a vertex and its color in each row

            -1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            1.0, 0.0, 0.0, 0.0, 0.0, 1.0
        ] ),

        'geometries': [ new zz.gl.Geometry( ) ],

        'getGeometries': function ( ) {

            return this[ 'geometries' ];
        }
    };

    // console.log(sceneWorker);

    var geometry = sceneWorker[ 'getGeometries' ]( )[ 0 ];

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

goog.exportSymbol( 'zz.gl.bootstrap', zz.gl.bootstrap );