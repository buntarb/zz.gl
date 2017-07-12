var radio = "move";

function Cardinal( Px, Py){

    var n = Px.length,
        n1 = n+1,
        n2 = n+2,
        Al = 6;

    var B0 = new Float64Array(26),
        B1 = new Float64Array(26),
        B2 = new Float64Array(26),
        B3 = new Float64Array(26);

    var t = 0;
    for( var i= 0; i < 26; i++ ){

        var t1 = 1 - t,
            t12 = t1 * t1,
            t2 = t * t;

        B0[ i ] = t1 * t12;
        B1[ i ] = 3 * t * t12;
        B2[ i ] = 3 * t2 * t1;
        B3[ i ] = t * t2;
        t += .04;
    }

    function drawSpline(){
        var step = 1/w,
            t = step;
        var scPx = new Float64Array( n2 ),
            scPy = new Float64Array( n2 );
        var X,
            Y;

        for( var i = 0; i < n; i++ ){

            scPx[ i + 1 ] = Px[ i ] * w;
            scPy[ i + 1 ] = Py[ i ] * h;
        }

        scPx[ 0 ] = scPx[ 1 ] - ( scPx[ 2 ] - scPx[ 1 ] );
        scPy[ 0 ] = scPy[ 1 ] - ( scPy[ 2 ] - scPy[ 1 ] );
        scPx[ n1 ] = scPx[ n ] + ( scPx[ n ] - scPx[ n-1 ] );
        scPy[ n1 ] = scPy[ n ] + ( scPy[ n ] - scPy[ n-1 ] );

        ctx.beginPath();
        ctx.moveTo( scPx[ 1 ], h1 - scPy[ 1 ] );

        for( var i = 1; i < n; i++ ){

            for( var k = 0; k < 26; k++ ){

                X = scPx[ i ] * B0[ k ] +
                    ( scPx[ i ] + ( scPx[ i + 1 ] - scPx[ i - 1] ) / Al ) * B1[ k ] +
                    ( scPx[ i + 1 ] - ( scPx[ i + 2 ] - scPx[ i ] ) / Al) * B2[ k ] +
                    scPx[ i + 1 ] * B3[ k ];

                Y = scPy[ i ] * B0[ k ] +
                    ( scPy[ i ] + ( scPy[ i + 1 ] - scPy[ i - 1 ] ) / Al ) * B1[ k ] +
                    ( scPy[ i + 1 ] - ( scPy[ i + 2 ] - scPy[ i ] ) / Al ) * B2[ k ] +
                    scPy[ i + 1 ] * B3[ k ];

                ctx.lineTo( X, h1 - Y);
            }
        }
        ctx.stroke();
    }
} // end Cardinal
