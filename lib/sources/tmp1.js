/**
 * Calculates an array containing points representing a cardinal spline through given point array.
 * Points must be arranged as: [x1, y1, x2, y2, ..., xn, yn].
 *
 * The points for the cardinal spline are returned as a new array.
 *
 * @param {Array} points - point array
 * @param {Number} [tension=0.5] - tension. Typically between [0.0, 1.0] but can be exceeded
 * @param {Number} [numOfSeg=25] - number of segments between two points (line resolution)
 * @returns {Float32Array} New array with the calculated points that was added to the path
 */
function getCurvePoints(points, tension, numOfSeg) {

    'use strict';

    // options or defaults
    tension = (typeof tension === 'number') ? tension : 0.5;
    numOfSeg = (typeof numOfSeg === 'number') ? numOfSeg : 25;

    var pts,															// for cloning point array
        i,
        l = points.length,
        rPos = 0,
        rLen = ( l - 2 ) * numOfSeg + 2,
        res = new Float32Array( rLen ),
        cache = new Float32Array( ( numOfSeg + 2 ) * 4),
        cachePtr = 4;

    pts = points.slice( 0 );
    pts.unshift( points[ 1 ] );											// copy 1. point and insert at beginning
    pts.unshift( points[ 0 ] );
    pts.push( points[ l - 2 ], points[ l - 1 ] );						// duplicate end-points

    // cache inner-loop calculations as they are based on t alone
    cache[ 0 ] = 1;														// 1,0,0,0

    for( i = 1; i < numOfSeg; i++ ){

        var st = i / numOfSeg,
            st2 = st * st,
            st3 = st2 * st,
            st23 = st3 * 2,
            st32 = st2 * 3;

        cache[ cachePtr++ ] = st23 - st32 + 1;							// c1 - h00
        cache[ cachePtr++ ] = st32 - st23;								// c2 - h01
        cache[ cachePtr++ ] = st3 - 2 * st2 + st;						// c3 - h10
        cache[ cachePtr++ ] = st3 - st2;								// c4 - h11
    }

    cache[++cachePtr] = 1;												// 0,1,0,0

    // calc. points
    for( i = 2; i < l; i += 2 ){

        var pt1 = pts[ i ],      // x0
            pt2 = pts[ i + 1 ],  // y0
            pt3 = pts[ i + 2 ],  // x1
            pt4 = pts[ i + 3 ],  // y1

            t1x = ( pt3 - pts[ i - 2 ] ) * tension,
            t1y = ( pt4 - pts[ i - 1 ] ) * tension,
            t2x = ( pts[ i + 4 ] - pt1 ) * tension,
            t2y = ( pts[ i + 5 ] - pt2 ) * tension,
            c = 0, c1, c2, c3, c4;

        for( var t = 0; t < numOfSeg; t++ ){

            c1 = cache[c++]; // c1 - h00
            c2 = cache[c++]; // c2 - h01
            c3 = cache[c++]; // c3 - h10
            c4 = cache[c++]; // c4 - h11

            res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
            res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
        }
    }

    // add last point
    l = points.length - 2;
    res[rPos++] = points[l++];
    res[rPos] = points[l];

    return res;
}

if (typeof exports !== "undefined") exports.getCurvePoints = getCurvePoints;