class StereoEffect {
	constructor( ) {
	  this.rendererL = new THREE.WebGLRenderer( { antialias: true } );
    this.rendererL.setSize(500,350);
	  this.rendererL.setPixelRatio( window.devicePixelRatio );
	  this.rendererL.outputEncoding = THREE.sRGBEncoding;
	  this.rendererL.shadowMap.enabled = true;
    
	  this.rendererR = new THREE.WebGLRenderer( { antialias: true } );
    this.rendererR.setSize(500,350);
	  this.rendererR.setPixelRatio( window.devicePixelRatio );
	  this.rendererR.outputEncoding = THREE.sRGBEncoding;
	  this.rendererR.shadowMap.enabled = true;
    //----------------------------------------------
    // TF-VISOR
    this.viewL = tfvis.visor().surface({ name: 'left-eye', tab: 'View' });
    this.viewR = tfvis.visor().surface({ name: 'right-eye', tab: 'View' });
    this.viewL.drawArea.appendChild(this.rendererL.domElement);
    this.viewR.drawArea.appendChild(this.rendererR.domElement);
  }
	setEyeSeparation( eyeSep ) {
		this.stereo.eyeSep = eyeSep;
  };
	setSize( width, height ) {
		this.rendererL.setSize( width, height );
		this.rendererR.setSize( width, height );
	};
	render( scene, camera ) {
		scene.updateMatrixWorld();
		if ( camera && camera.parent === null ) camera.updateMatrixWorld();
    if ( camera ) this.stereo.update( camera );
		this.rendererL.render( scene, this.stereo.cameraL );
		this.rendererR.render( scene, this.stereo.cameraR );
  };
}
