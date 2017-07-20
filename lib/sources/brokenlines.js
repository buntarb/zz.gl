goog.provide( 'zz.gl.BrokenLines' );

goog.require( 'zz.gl.ALines' );

goog.require( 'goog.vec.Mat4' );
goog.require( 'goog.vec.Vec4' );

/**
 * Scene worker for meshes with broken line geometries.
 * @param {number=} opt_expectedCount Expected count of points to achieve optimal performance.
 */
zz.gl.BrokenLines = class extends zz.gl.ALines {

	constructor( opt_expectedCount ){

	    super( opt_expectedCount );
	}

    /**
     * @inheritDoc
     * @override
     */
    create( opt_params, opt_config ){

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
            if( Math.floor( dimColor.length / strideDimColor ) !== countVertex ){

                dimColor = zz.gl.AMeshes.getAlignedLerpColorDim( countVertex, dimColor, offsetDimColor, strideDimColor );
                offsetDimColor = 0;
                strideDimColor = 1;
            }

            if( countVertex >= 2 ){

                this.createLineInternal(
                    countVertex,
                    dimX, offsetDimX, strideDimX,
                    dimY, offsetDimY, strideDimY,
                    dimZ, offsetDimZ, strideDimZ,
                    dimColor, offsetDimColor, strideDimColor
                );

            }
        }
    }
};
goog.addSingletonGetter( zz.gl.BrokenLines );
