/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

THREE.DragControls = function ( _objects, _camera, _domElement, _m_linegroup ) {

    if ( _objects instanceof THREE.Camera ) {

        console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
        var temp = _objects; _objects = _camera; _camera = temp;

    }

    var _plane = new THREE.Plane();
    var _raycaster = new THREE.Raycaster();

    var _mouse = new THREE.Vector2();
    var _offset = new THREE.Vector3();
    var _intersection = new THREE.Vector3();
    var _worldPosition = new THREE.Vector3();
    var _inverseMatrix = new THREE.Matrix4();

    var _selected = null, _hovered = null;

    //

    var scope = this;

    function activate() {

        _domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
        _domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
        _domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
        _domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
        _domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
        _domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
        _domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );

    }

    function deactivate() {

        _domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
        _domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
        _domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
        _domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
        _domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
        _domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
        _domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );

        _domElement.style.cursor = '';
    }

    function dispose() {

        deactivate();

    }

    function onDocumentMouseMove( event ) {

        event.preventDefault();

        // var rect = _domElement.getBoundingClientRect();
        var mainCanvas = _domElement.querySelector("#iframe_box canvas");
        var rect = mainCanvas.getBoundingClientRect();

        _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );

        if ( _selected && scope.enabled ) {

            if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

                _selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

            }

            scope.dispatchEvent( { type: 'drag', object: _selected } );

            return;

        }

        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _objects ,true);

        if ( intersects.length > 0 ) {

            var object = intersects[ 0 ].object;
            var tempPoints = object.position;
            var tempLine2Cor = [];
            for (let i = 0; i < _m_linegroup.children.length; i++) {
                for(let j=0;j<_m_linegroup.children[i].geometry.vertices.length;j++){
                    tempLine2Cor.push([_m_linegroup.children[i].geometry.vertices[j].x,_m_linegroup.children[i].geometry.vertices[j].y]);
                }
            }
            var tempLine2 = turf.lineString(tempLine2Cor);
            var points = new THREE.Vector3(tempPoints.x,tempPoints.y,0);
            var tempLine1 = turf.lineString([[points.x,points.y],[points.x,0]]);
            var interPoint = turf.lineIntersect(tempLine1, tempLine2);
            points = new THREE.Vector3(tempPoints.x, interPoint.features[0].geometry.coordinates[1], 0);

            var tempMatrix = {"elements":[1,0,0,0,0,1,0,0,0,0,1,0,points.x,points.y,0,1]}

            _plane.setFromNormalAndCoplanarPoint( new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,1));
            // _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );
            // _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition(tempMatrix));

            if ( _hovered !== object ) {

                scope.dispatchEvent( { type: 'hoveron', object: object } );

                _domElement.body.style.cursor = 'pointer';
                _hovered = object;

            }

        } else {

            if ( _hovered !== null ) {

                scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

                _domElement.body.style.cursor = 'auto';
                _hovered = null;

            }

        }

    }

    function onDocumentMouseDown( event ) {

        event.preventDefault();

        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _objects );

        if ( intersects.length > 0 ) {

            _selected = intersects[ 0 ].object;

            if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

                _inverseMatrix.getInverse( _selected.parent.matrixWorld );
                _offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );
                // _offset.copy( _intersection ).sub( tempMatrix );

            }

            _domElement.body.style.cursor = 'move';

            scope.dispatchEvent( { type: 'dragstart', object: _selected } );

        }


    }

    function onDocumentMouseCancel( event ) {

        event.preventDefault();

        if ( _selected ) {

            scope.dispatchEvent( { type: 'dragend', object: _selected } );

            _selected = null;

        }

        _domElement.body.style.cursor = _hovered ? 'pointer' : 'auto';

    }

    function onDocumentTouchMove( event ) {

        event.preventDefault();
        event = event.changedTouches[ 0 ];

        var mainCanvas = _domElement.querySelector("#iframe_box canvas");
        var rect = mainCanvas.getBoundingClientRect()

        _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
        _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );

        if ( _selected && scope.enabled ) {

            if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

                _selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

            }

            scope.dispatchEvent( { type: 'drag', object: _selected } );

            return;

        }

    }

    function onDocumentTouchStart( event ) {

        event.preventDefault();
        event = event.changedTouches[ 0 ];

        var mainCanvas = _domElement.querySelector("#iframe_box canvas");
        var rect = mainCanvas.getBoundingClientRect()

        _mouse.x = (  event.clientX / rect.innerWidth ) * 2 - 1;
        _mouse.y = - ( event.clientY  / rect.innerHeight ) * 2 + 1;

        _raycaster.setFromCamera( _mouse, _camera );

        var intersects = _raycaster.intersectObjects( _objects );

        if ( intersects.length > 0 ) {

            _selected = intersects[ 0 ].object;

            // _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );
            _plane.setFromNormalAndCoplanarPoint( new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,1) );

            if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

                _inverseMatrix.getInverse( _selected.parent.matrixWorld );
                _offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

            }

            _domElement.style.cursor = 'move';

            scope.dispatchEvent( { type: 'dragstart', object: _selected } );

        }


    }

    function onDocumentTouchEnd( event ) {

        event.preventDefault();

        if ( _selected ) {

            scope.dispatchEvent( { type: 'dragend', object: _selected } );

            _selected = null;

        }

        _domElement.style.cursor = 'auto';

    }

    activate();

    // API

    this.enabled = true;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;

    // Backward compatibility

    this.setObjects = function () {

        console.error( 'THREE.DragControls: setObjects() has been removed.' );

    };

    this.on = function ( type, listener ) {

        console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
        scope.addEventListener( type, listener );

    };

    this.off = function ( type, listener ) {

        console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
        scope.removeEventListener( type, listener );

    };

    this.notify = function ( type ) {

        console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
        scope.dispatchEvent( { type: type } );

    };

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;