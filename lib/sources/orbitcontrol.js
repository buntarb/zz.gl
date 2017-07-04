goog.provide( 'zz.gl.OrbitControl' );

goog.require( 'goog.events.EventHandler' );
goog.require( 'goog.events.EventType' );

goog.require( 'goog.vec.Mat4' );
goog.require( 'goog.vec.Vec3' );


/**
 * Orbit control.
 * @param {zz.gl.ICamera} camera
 * @param {Element} dom
 */
zz.gl.OrbitControl = class extends goog.events.EventHandler {

    constructor( camera, dom ) {

        super( );

        this.isMouseDown = false;
        this.onMouseDownTheta = 0; // 45
        this.onMouseDownPhi = 0; // 60
        this.theta = 0; // 45
        this.phi = 0; // 60
        this.onMouseDownPosition = { };
        this.radius = 1;
        this.scale_ = 1;
        this.viewMatrix_ = camera.getViewMatrix( );
        this.eyePt_ = goog.vec.Vec3.createFloat32FromValues(

            this.radius * Math.sin( this.theta * Math.PI / 360 ) * Math.cos( this.phi * Math.PI / 360 ),
            this.radius * Math.sin( this.phi * Math.PI / 360 ),
            this.radius * Math.cos( this.theta * Math.PI / 360 ) * Math.cos( this.phi * Math.PI / 360 )
        );
        this.centerPt_ = goog.vec.Vec3.createFloat32FromValues( 0.0, 0.0, 0.0 );
        this.worldUpVec_ = goog.vec.Vec3.createFloat32FromValues( 0.0, 1.0, 0.0 );

        goog.vec.Mat4.makeLookAt( this.viewMatrix_, this.eyePt_, this.centerPt_, this.worldUpVec_ );
        goog.vec.Mat4.scale( this.viewMatrix_, this.scale_, this.scale_, this.scale_ );

        this.listenWithScope(

            dom,
            goog.events.EventType.MOUSEMOVE,
            this.mouseMoveListener_,
            false,
            this
        );

        this.listenWithScope(

            dom,
            goog.events.EventType.MOUSEUP,
            this.mouseUpListener_,
            false,
            this
        );

        this.listenWithScope(

            dom,
            goog.events.EventType.MOUSEDOWN,
            this.mouseDownListener_,
            false,
            this
        );

        this.listenWithScope(

            dom,
            goog.events.EventType.WHEEL,
            this.mouseWheelListener_,
            false,
            this
        );
    }

    /**
     * Listener for mousemove event attached to dom element.
     * @param {goog.events.BrowserEvent} evt
     */
    mouseMoveListener_( evt ){

        evt.preventDefault();

        if ( this.isMouseDown ) {

            this.theta = - ( ( evt.clientX - this.onMouseDownPosition.x ) * 0.5 ) + this.onMouseDownTheta;
            this.phi = ( ( evt.clientY - this.onMouseDownPosition.y ) * 0.5 ) + this.onMouseDownPhi;
            this.phi = Math.min( 180, Math.max( -180, this.phi ) );

            goog.vec.Vec3.setFromValues(

                this.eyePt_,
                this.radius * Math.sin( this.theta * Math.PI / 360 ) * Math.cos( this.phi * Math.PI / 360 ),
                this.radius * Math.sin( this.phi * Math.PI / 360 ),
                this.radius * Math.cos( this.theta * Math.PI / 360 ) * Math.cos( this.phi * Math.PI / 360 )
            );
            goog.vec.Mat4.makeLookAt( this.viewMatrix_, this.eyePt_, this.centerPt_, this.worldUpVec_ );
            goog.vec.Mat4.scale( this.viewMatrix_, this.scale_, this.scale_, this.scale_ );
        }
    }

    /**
     * Listener for mouseup event attached to dom element.
     * @param {goog.events.BrowserEvent} evt
     */
    mouseUpListener_( evt ){

        evt.preventDefault();

        this.isMouseDown = false;
        this.onMouseDownPosition.x = evt.clientX - this.onMouseDownPosition.x;
        this.onMouseDownPosition.y = evt.clientY - this.onMouseDownPosition.y;
    }

    /**
     * Listener for mouse down event.
     * @param {goog.events.Event} evt
     * @private
     */
    mouseDownListener_( evt ){

        evt.preventDefault();

        this.isMouseDown = true;
        this.onMouseDownTheta = this.theta;
        this.onMouseDownPhi = this.phi;
        this.onMouseDownPosition.x = evt.clientX;
        this.onMouseDownPosition.y = evt.clientY;
    }

    /**
     * Listener for mouse wheel event.
     * @param {goog.events.Event} evt
     * @private
     */
    mouseWheelListener_( evt ){

        evt.preventDefault( );

        if( evt.event_.deltaY >= 0 ){

            this.scale_ -= this.scale_ / 10;
            this.scale_ = Math.max( 0.01, this.scale_ );

        }else{

            this.scale_ += this.scale_ / 10;
            this.scale_ = Math.min( 20, this.scale_ );
        }

        goog.vec.Vec3.setFromValues(

            this.eyePt_,
            this.radius * Math.sin( this.theta * Math.PI / 360 ) * Math.cos( this.phi * Math.PI / 360 ),
            this.radius * Math.sin( this.phi * Math.PI / 360 ),
            this.radius * Math.cos( this.theta * Math.PI / 360 ) * Math.cos( this.phi * Math.PI / 360 )
        );
        goog.vec.Mat4.makeLookAt( this.viewMatrix_, this.eyePt_, this.centerPt_, this.worldUpVec_ );
        goog.vec.Mat4.scale( this.viewMatrix_, this.scale_, this.scale_, this.scale_ );
    }
}