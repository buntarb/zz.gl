goog.provide( 'zz.gl.ICamera' );

/**
 * An interface that represents camera.
 * @interface
 */
zz.gl.ICamera = class {

    /**
     * @return {goog.vec.Mat4}
     */
    getProjectionMatrix( ){ }

    /**
     * @return {goog.vec.Mat4}
     */
    getViewMatrix( ){ }
};