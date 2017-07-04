goog.provide( 'zz.gl.OrthographicCamera' );

goog.require( 'goog.vec.Mat4' );

/**
 * Orthographic camera.
 * @param {number} left The coordinate of the left of clipping plane.
 * @param {number} right The coordinate of the right of clipping plane.
 * @param {number} bottom The coordinate of the bottom of clipping plane.
 * @param {number} top The coordinate of the top top clipping plane.
 * @param {number} near The distances to the nearer depth clipping plane.
 *  This value is minus if the plane is to be behind the viewer.
 * @param {number} far The distances to the farther depth clipping plane.
 *  This value is minus if the plane is to be behind the viewer.
 * @implements {zz.gl.ICamera}
 */
zz.gl.OrthographicCamera = class {

    constructor( left, right, bottom, top, near, far ){

        this.projMatrix_ = goog.vec.Mat4.createFloat32( );
        goog.vec.Mat4.makeOrtho( this.projMatrix_, left, right, bottom, top, near, far );

        this.viewMatrix_ = goog.vec.Mat4.createFloat32Identity( );
    }

    /** @inheritDoc */
    getProjectionMatrix( ){

        return this.projMatrix_;
    }

    /** @inheritDoc */
    getViewMatrix( ){

        return this.viewMatrix_;
    }
};