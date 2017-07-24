goog.provide( 'zz.gl.CurveLines' );

goog.require( 'zz.gl.ALines' );

goog.require( 'goog.vec.Mat4' );
goog.require( 'goog.vec.Vec4' );

/**
 * Scene worker for meshes with curve line geometries.
 * @param {number=} opt_expectedCount Expected count of points to achieve optimal performance.
 */
zz.gl.CurveLines = class extends zz.gl.ALines {

	constructor( opt_expectedCount ){

	    super( opt_expectedCount );
	}

    /**
     * @inheritDoc
     * @override
     */
    create( opt_params, opt_config ){

        // console.time('curveGenerate');

        if( goog.isDefAndNotNull( opt_params ) ){

            var dimX = this.getDimByParamName( this.DIM_X, opt_params, opt_config );
            var offsetDimX = this.getValueByParamName( this.OFFSET_DIM_X, opt_params, opt_config, 0 );
            var strideDimX = this.getValueByParamName( this.STRIDE_DIM_X, opt_params, opt_config, 1 );
            var dimY = this.getDimByParamName( this.DIM_Y, opt_params, opt_config );
            var offsetDimY = this.getValueByParamName( this.OFFSET_DIM_Y, opt_params, opt_config, 0 );
            var strideDimY = this.getValueByParamName( this.STRIDE_DIM_Y, opt_params, opt_config, 1 );
            var dimZ = this.getDimByParamName( this.DIM_Z, opt_params, opt_config );
            var offsetDimZ = this.getValueByParamName( this.OFFSET_DIM_Z, opt_params, opt_config, 0 );
            var strideDimZ = this.getValueByParamName( this.STRIDE_DIM_Z, opt_params, opt_config, 1 );
            var dimColor = this.getDimByParamName( this.DIM_COLOR, opt_params, opt_config, 0xFFFFFF );
            var offsetDimColor = this.getValueByParamName( this.OFFSET_DIM_COLOR, opt_params, opt_config, 0 );
            var strideDimColor = this.getValueByParamName( this.STRIDE_DIM_COLOR, opt_params, opt_config, 1 );

            var countVertex = Math.floor( Math.max(

                dimX.length / strideDimX,
                dimY.length / strideDimY,
                dimZ.length / strideDimZ
            ) );

            if( Math.floor( dimX.length / strideDimX ) !== countVertex ){

                dimX = zz.gl.AMeshes.getAlignedLerpDim( countVertex, dimX, offsetDimX, strideDimX );
                offsetDimX = 0;
                strideDimX = 1;
            }
            if( Math.floor( dimY.length / strideDimY ) !== countVertex ){

                dimY = zz.gl.AMeshes.getAlignedLerpDim( countVertex, dimY, offsetDimY, strideDimY );
                offsetDimY = 0;
                strideDimY = 1;
            }
            if( Math.floor( dimZ.length / strideDimZ ) !== countVertex ){

                dimZ = zz.gl.AMeshes.getAlignedLerpDim( countVertex, dimZ, offsetDimZ, strideDimZ );
                offsetDimZ = 0;
                strideDimZ = 1;
            }

            var curveDims = zz.gl.CurveLines.getCurvePoints(
                countVertex,
                dimX, offsetDimX, strideDimX,
                dimY, offsetDimY, strideDimY,
                dimZ, offsetDimZ, strideDimZ,
                0.5, 25
            );

            countVertex = Math.floor( Math.max(

                curveDims[ 0 ].length,
                curveDims[ 1 ].length,
                curveDims[ 2 ].length
            ) );

            dimColor = zz.gl.AMeshes.getAlignedLerpColorDim( countVertex, dimColor, offsetDimColor, strideDimColor );
            offsetDimColor = 0;
            strideDimColor = 1;

            if( countVertex >= 2 ){

                this.createLineInternal(
                    countVertex,
                    curveDims[ 0 ], offsetDimX, strideDimX,
                    curveDims[ 1 ], offsetDimY, strideDimY,
                    curveDims[ 2 ], offsetDimZ, strideDimZ,
                    dimColor, offsetDimColor, strideDimColor
                );
            }
        }

        // console.timeEnd('curveGenerate');
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
    static getCurvePoints( countVertex,
                           dimX, offsetDimX, strideDimX,
                           dimY, offsetDimY, strideDimY,
                           dimZ, offsetDimZ, strideDimZ,
                           tension, numOfSeg ) {

        var knotsSegmentCount = countVertex - 1;
        var resLen = knotsSegmentCount * numOfSeg + 1;
        var resDimX = new Float32Array( resLen );
        var resDimY = new Float32Array( resLen );
        var resDimZ = new Float32Array( resLen );

        var resPosX = 0;
        var resPosY = 0;
        var resPosZ = 0;

        var iX = 0;
        var iY = 0;
        var iZ = 0;

        resDimX[ resPosX++ ] = dimX[ offsetDimX ];
        resDimY[ resPosY++ ] = dimY[ offsetDimY ];
        resDimZ[ resPosZ++ ] = dimZ[ offsetDimZ ];

        var pointLeft = goog.vec.Vec4.createFloat32( );
        var point0 = goog.vec.Vec4.createFloat32( );
        var point1 = goog.vec.Vec4.createFloat32( );
        var pointRight = goog.vec.Vec4.createFloat32( );

        var tangentFrom = goog.vec.Vec4.createFloat32( );
        var tangentTo = goog.vec.Vec4.createFloat32( );
        var knotsMatrix = goog.vec.Mat4.createFloat32( );
        var powers = goog.vec.Vec4.createFloat32( );
        var curvePoint = goog.vec.Vec4.createFloat32( );
        var tempMatrix = goog.vec.Mat4.createFloat32( );

        var polynomialsMatrix = zz.gl.CurveLines.getHermitePolynomialsMatrix( );
        // var polynomialsMatrix = zz.gl.CurveLines.getBezierPolynomialsMatrix( );

        for( var i = 1; i <= knotsSegmentCount; i++ ){

            if( i <= 1 ){

                pointLeft = goog.vec.Vec4.setFromValues(
                    pointLeft,
                    dimX[ offsetDimX + iX ],
                    dimY[ offsetDimY + iY ],
                    dimZ[ offsetDimZ + iZ ],
                    0.0
                );

            }else{

                pointLeft = goog.vec.Vec4.setFromValues(
                    pointLeft,
                    dimX[ offsetDimX + iX - 1 ],
                    dimY[ offsetDimY + iY - 1 ],
                    dimZ[ offsetDimZ + iZ - 1 ],
                    0.0
                );
            }

            point0 = goog.vec.Vec4.setFromValues(
                point0,
                dimX[ offsetDimX + iX ],
                dimY[ offsetDimY + iY ],
                dimZ[ offsetDimZ + iZ ],
                0.0
            );
            point1 = goog.vec.Vec4.setFromValues(
                point1,
                dimX[ offsetDimX + iX + 1 ],
                dimY[ offsetDimY + iY + 1 ],
                dimZ[ offsetDimZ + iZ + 1 ],
                0.0
            );

            if( i >= knotsSegmentCount ){

                pointRight = goog.vec.Vec4.setFromValues(
                    pointRight,
                    dimX[ offsetDimX + iX + 1 ],
                    dimY[ offsetDimY + iY + 1 ],
                    dimZ[ offsetDimZ + iZ + 1 ],
                    0.0
                );

            }else{

                pointRight = goog.vec.Vec4.setFromValues(
                    pointRight,
                    dimX[ offsetDimX + iX + 2 ],
                    dimY[ offsetDimY + iY + 2 ],
                    dimZ[ offsetDimZ + iZ + 2 ],
                    0.0
                );
            }

            tangentFrom = zz.gl.CurveLines.getCardinalTangent( pointLeft, point1, tension, tangentFrom );
            tangentTo = zz.gl.CurveLines.getCardinalTangent( point0, pointRight, tension, tangentTo );
            knotsMatrix = zz.gl.CurveLines.getKnotsMatrix( point0, point1, tangentFrom, tangentTo, knotsMatrix );

            for ( var t = 1; t <= numOfSeg ; t++ ){

                var scale = t / numOfSeg;
                powers = zz.gl.CurveLines.getScalePowersVector( scale, powers );
                curvePoint = zz.gl.CurveLines.getCurvePoint(
                    knotsMatrix, polynomialsMatrix, powers,
                    tempMatrix, curvePoint
                );

                resDimX[ resPosX++ ] = curvePoint[ 0 ];
                resDimY[ resPosY++ ] = curvePoint[ 1 ];
                resDimZ[ resPosZ++ ] = curvePoint[ 2 ];
            }

            iX = iX + strideDimX;
            iY = iY + strideDimY;
            iZ = iZ + strideDimZ;
        }

        return [ resDimX, resDimY, resDimZ ];
    }

    static getCardinalTangent( pointFrom, pointTo, tension, opt_targetVector4 ){

        var targetVector = opt_targetVector4 || goog.vec.Vec4.createFloat32( );

        // tension * ( pointTo - pointFrom )

        targetVector = goog.vec.Vec4.subtract( pointTo, pointFrom, targetVector );
        return goog.vec.Vec4.scale( targetVector, tension, targetVector );
    }

    static getKnotsMatrix( pointFrom, pointTo, tangentFrom, tangentTo, opt_targetMatrix ){

        var targetMatrix = opt_targetMatrix || goog.vec.Mat4.createFloat32( );
        return goog.vec.Mat4.setColumns( targetMatrix, pointFrom, pointTo, tangentFrom, tangentTo );
    }

    static getHermitePolynomialsMatrix( opt_targetMatrix4 ){

        var targetMatrix = opt_targetMatrix4 || goog.vec.Mat4.createFloat32( );
        return goog.vec.Mat4.setFromValues(
           targetMatrix,
            2.0, -2.0,  1.0,  1.0,
           -3.0,  3.0, -2.0, -1.0,
            0.0,  0.0,  1.0,  0.0,
            1.0,  0.0,  0.0,  0.0
       );
    }

    static getBezierPolynomialsMatrix( opt_targetMatrix4 ){

        var targetMatrix = opt_targetMatrix4 || goog.vec.Mat4.createFloat32( );
        return goog.vec.Mat4.setFromValues(
            targetMatrix,

            -1.0,  3.0, -3.0, 1.0,
             3.0, -6.0,  3.0, 0.0,
            -3.0,  3.0,  0.0, 0.0,
             1.0,  0.0,  0.0, 0.0

            // -1.0,  3.0, -3.0, 1.0,
            //  3.0, -6.0,  3.0, 0.0,
            // -3.0,  0.0,  3.0, 0.0,
            //  1.0,  4.0,  1.0, 0.0
        );
    }

    static getScalePowersVector( scale, opt_targetVector4 ){

        var targetVector = opt_targetVector4 || goog.vec.Vec4.createFloat32( );
        return goog.vec.Vec4.setFromValues(
            targetVector,
            scale * scale * scale,
            scale * scale,
            scale,
            1.0
        );
    }

    static getCurvePoint( knotsMatrix4, polynomialsMatrix4, scalePowersVector4, opt_tempMatrix4, opt_curvePoint ){

        var tempMatrix = opt_tempMatrix4 || goog.vec.Mat4.createFloat32( );
        var curvePoint = opt_curvePoint || goog.vec.Vec4.createFloat32( );

        // knotsMatrix * polynomialsMatrix * scalePowersVector;

        tempMatrix = goog.vec.Mat4.multMat( knotsMatrix4, polynomialsMatrix4, tempMatrix );
        return goog.vec.Mat4.multVec4( tempMatrix, scalePowersVector4, curvePoint );
    }
};
goog.addSingletonGetter( zz.gl.CurveLines );
