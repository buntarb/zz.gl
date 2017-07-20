goog.provide( 'zz.gl.ISceneWorker' );

/**
 * An interface that managed any geometries.
 * @interface
 */
zz.gl.ISceneWorker = class {

    /**
     * @return {Array<zz.gl.Geometry>}
     */
    getGeometries( ){ }
};