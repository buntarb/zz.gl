goog.provide( 'zz.gl.BrokenLines' );

goog.require( 'zz.gl.Meshes' );

goog.require( 'zz.gl.enums.Primitives' );
goog.require( 'zz.gl.Geometry' );
goog.require( 'zz.gl.enums.GeometryParameters' );
goog.require( 'zz.gl.enums.DrawMethod' );
goog.require( 'zz.gl.enums.BufferType' );

/**
 * Scene worker for meshes with broken line geometries.
 * @param {number=} opt_expectedCount Expected count of points to achieve optimal performance.
 */
zz.gl.BrokenLines = class extends zz.gl.Meshes {

	constructor( opt_expectedCount ){

	    super( opt_expectedCount );

        /**
         * A map of arrays of vertices and colors.
         * Each key is a line id that has given from counter.
         * @type {Object.<string, Array.<Float32Array>>}
         * @private
         */
        this.linesMap_ = { };

        /**
         * Actual count of lines
         * @type {number}
         * @private
         */
        this.actualCount_ = 0;

        /**
         * The required length to store vertex information in array.
         * @const
         * @type {number}
         */
        this.LEN = 3;
	}

    /**
     * @inheritDoc
     * @override
     */
    getDefaultParamsConfig( opt_params, opt_config ){

        var config = { };

        /**
         * x, y, z are a translate position of the line.
         */
        config[ this.X ] = this.X;
        config[ this.Y ] = this.Y;
        config[ this.Z ] = this.Z;

        config[ this.COLOR_HEX ] = this.COLOR_HEX;

        /**
         * Represents an array of points for one line
         */
        config[ this.VERTICES ] = this.VERTICES;

        return config;
    }

    /**
     * @inheritDoc
     * @override
     */
    createOne( opt_params, opt_config ){

        if( goog.isDefAndNotNull( opt_params ) ){

            var vertices = opt_params[ this.getParamName( this.VERTICES, opt_config) ];
            if( vertices && vertices.length >= this.LEN * 2 ){

                var line = [ ];
                line[ 0 ] = new Float32Array( vertices );

                var color = zz.gl.Meshes.getColorRgbFromHex(

                    opt_params? opt_params[ this.getParamName( this.COLOR_HEX, opt_config) ] || 0xFFFFFF: 0xFFFFFF
                );
                var colors  = new Float32Array( vertices.length );
                for( var offset = 0; offset < vertices.length; offset += this.LEN ){

                    colors.set( [ color[ 'r' ], color[ 'g' ], color[ 'b' ] ], offset );
                }
                line[ 1 ] = colors;

                this.linesMap_[ '' + this.actualCount_ ] = line;
                this.actualCount_++;

                var geometry = this.createGeometry_( line );
                this.geometries_.push( geometry );

            }else{

                vertices = opt_params[ 'vertices2D' ];
                // vertices = opt_params[ this.VERTICES ];
                if( vertices ){

                    var line = [ ];
                    line[ 0 ] = this.getCurvePoints( vertices );

                    var color = zz.gl.Meshes.getColorRgbFromHex(

                        opt_params? opt_params[ this.getParamName( this.COLOR_HEX, opt_config) ] || 0xFFFFFF: 0xFFFFFF
                    );
                    var colors  = new Float32Array( this.LEN * line[ 0 ].length / 2 );
                    for( var offset = 0, colorOffset = 0; offset < line[ 0 ].length; offset += 2, colorOffset += 3 ){

                        colors.set( [ color[ 'r' ], color[ 'g' ], color[ 'b' ] ], colorOffset );
                    }
                    line[ 1 ] = colors;

                    this.linesMap_[ '' + this.actualCount_ ] = line;
                    this.actualCount_++;

                    var geometry = this.createGeometry_( line );
                    this.geometries_.push( geometry );

                    console.log(geometry);
                }
            }
        }
    }

    /**
     * @inheritDoc
     * @override
     */
    createMany( opt_params, opt_config ){ }

    /**
     * Create new geometry.
     * @param {Array.<Float32Array>} line An array of vertices and colors.
     * @return {zz.gl.Geometry}
     * @private
     */
    createGeometry_( line ){

        var geometry = new zz.gl.Geometry( );

        // var param = zz.gl.enums.GeometryParameters.POSITION;
        // geometry.setParameter( param, { } );
        // geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        // geometry.setParameterCountPerElement( param, 3 );
        // geometry.setParameterStride( param, line[ 0 ].BYTES_PER_ELEMENT * this.LEN );
        // geometry.setParameterOffset( param, line[ 0 ].BYTES_PER_ELEMENT * 0 );
        // geometry.setParameterData( param, line[ 0 ] );
        //
        // param = zz.gl.enums.GeometryParameters.COLOR;
        // geometry.setParameter( param, { } );
        // geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        // geometry.setParameterCountPerElement( param, 3 );
        // geometry.setParameterStride( param, line[ 1 ].BYTES_PER_ELEMENT * this.LEN );
        // geometry.setParameterOffset( param, line[ 1 ].BYTES_PER_ELEMENT * 0 );
        // geometry.setParameterData( param, line[ 1 ] );
        //
        // geometry.setDrawMethod( zz.gl.enums.DrawMethod.DRAW_ARRAYS );
        // geometry.setPrimitive( zz.gl.enums.Primitives.LINE_STRIP );
        // geometry.setFirst( 0 );
        // geometry.setCount( line[ 0 ].length / this.LEN );

        var param = zz.gl.enums.GeometryParameters.POSITION;
        geometry.setParameter( param, { } );
        geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        geometry.setParameterCountPerElement( param, 2 );
        geometry.setParameterStride( param, line[ 0 ].BYTES_PER_ELEMENT * 2 );
        geometry.setParameterOffset( param, line[ 0 ].BYTES_PER_ELEMENT * 0 );
        geometry.setParameterData( param, line[ 0 ] );

        param = zz.gl.enums.GeometryParameters.COLOR;
        geometry.setParameter( param, { } );
        geometry.setParameterBufferType( param, zz.gl.enums.BufferType.ARRAY_BUFFER );
        geometry.setParameterCountPerElement( param, 3 );
        geometry.setParameterStride( param, line[ 1 ].BYTES_PER_ELEMENT * this.LEN );
        geometry.setParameterOffset( param, line[ 1 ].BYTES_PER_ELEMENT * 0 );
        geometry.setParameterData( param, line[ 1 ] );

        geometry.setDrawMethod( zz.gl.enums.DrawMethod.DRAW_ARRAYS );
        geometry.setPrimitive( zz.gl.enums.Primitives.LINE_STRIP );
        geometry.setFirst( 0 );
        geometry.setCount( line[ 0 ].length / 2 );

        return geometry;
    }

    /**
     * Calculates an array containing points representing a cardinal spline through given point array.
     * Points must be arranged as: [x1, y1, x2, y2, ..., xn, yn].
     *
     * The points for the cardinal spline are returned as a new array.
     *
     * @param {Array} points - point array
     * @param {Number} [tension=0.5] - tension. Typically between [0.0, 1.0] but can be exceeded
     * @param {Number} [numOfSeg=25] - number of segments between two points (line resolution)
     * @param {Boolean} [close=false] - Close the ends making the line continuous
     * @returns {Float32Array} New array with the calculated points that was added to the path
     */
    static getCurvePoints(points, tension, numOfSeg, close) {

        // 'use strict';

        // options or defaults
        tension = (typeof tension === 'number') ? tension : 0.5;
        numOfSeg = (typeof numOfSeg === 'number') ? numOfSeg : 25;

        var pts,															// for cloning point array
            i = 1,
            l = points.length,
            rPos = 0,
            rLen = (l-2) * numOfSeg + 2 + (close ? 2 * numOfSeg: 0),
            res = new Float32Array(rLen),
            cache = new Float32Array((numOfSeg + 2) * 4),
            cachePtr = 4;

        pts = points.slice(0);

        if (close) {
            pts.unshift(points[l - 1]);										// insert end point as first point
            pts.unshift(points[l - 2]);
            pts.push(points[0], points[1]); 								// first point as last point
        }
        else {
            pts.unshift(points[1]);											// copy 1. point and insert at beginning
            pts.unshift(points[0]);
            pts.push(points[l - 2], points[l - 1]);							// duplicate end-points
        }

        // cache inner-loop calculations as they are based on t alone
        cache[0] = 1;														// 1,0,0,0

        for (; i < numOfSeg; i++) {

            var st = i / numOfSeg,
                st2 = st * st,
                st3 = st2 * st,
                st23 = st3 * 2,
                st32 = st2 * 3;

            cache[cachePtr++] =	st23 - st32 + 1;							// c1
            cache[cachePtr++] =	st32 - st23;								// c2
            cache[cachePtr++] =	st3 - 2 * st2 + st;							// c3
            cache[cachePtr++] =	st3 - st2;									// c4
        }

        cache[++cachePtr] = 1;												// 0,1,0,0

        // calc. points
        parse(pts, cache, l, tension);

        if (close) {
            //l = points.length;
            pts = [];
            pts.push(points[l - 4], points[l - 3],
                points[l - 2], points[l - 1], 							// second last and last
                points[0], points[1],
                points[2], points[3]); 								// first and second
            parse(pts, cache, 4, tension);
        }

        function parse(pts, cache, l, tension) {

            for (var i = 2, t; i < l; i += 2) {

                var pt1 = pts[i],
                    pt2 = pts[i+1],
                    pt3 = pts[i+2],
                    pt4 = pts[i+3],

                    t1x = (pt3 - pts[i-2]) * tension,
                    t1y = (pt4 - pts[i-1]) * tension,
                    t2x = (pts[i+4] - pt1) * tension,
                    t2y = (pts[i+5] - pt2) * tension,
                    c = 0, c1, c2, c3, c4;

                for (t = 0; t < numOfSeg; t++) {

                    c1 = cache[c++];
                    c2 = cache[c++];
                    c3 = cache[c++];
                    c4 = cache[c++];

                    res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
                    res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
                }
            }
        }

        // add last point
        l = close ? 0 : points.length - 2;
        res[rPos++] = points[l++];
        res[rPos] = points[l];

        return res;
    }
};
goog.addSingletonGetter( zz.gl.BrokenLines );
