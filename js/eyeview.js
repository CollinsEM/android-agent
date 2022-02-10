class EyeView {
  constructor(id, scene, camera, showStats) {
    this.id = id;
    this.visor = tfvis.visor().surface({name: id, tab: 'View'});
    this.container = this.visor.drawArea;
    this.showStats = ( showStats !== undefined ? showStats : true );
    
    // Scene
	  this.scene = ( scene !== undefined ? scene : new THREE.Scene() );

	  // Camera
    this.width = 500; // Math.ceil(window.innerWidth/4);
    this.height = 350; // Math.ceil(window.innerHeight/4);
    this.aspect = this.width / this.height;
	  this.camera = ( camera !== undefined ? camera :
                    new THREE.PerspectiveCamera( 65, this.aspect, 0.1, 1000 ) );
    
    // Raycaster
    this.raycaster = new THREE.Raycaster();
    
	  // Renderer
	  this.renderer = new THREE.WebGLRenderer( { antialias: false } );
 	  // this.renderer.setClearColor( this.scene.fog.color, 1 );
 	  this.renderer.setClearColor( 0xffffff, 1 );
	  this.renderer.setPixelRatio( window.devicePixelRatio );
	  this.renderer.setSize( this.width, this.height );
    this.renderer.autoClear = false;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
	  this.container.appendChild( this.renderer.domElement );

    // Other
    this.mouse = new THREE.Vector2();

    // DAT.GUI
    if (this.showStats) {
      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '0px';
      this.container.appendChild( this.stats.domElement );
    }
    
    window.addEventListener( 'resize', function(_this) {
      return function(ev) {
        _this.width  = Math.ceil(window.innerWidth/4);
        _this.height = Math.ceil(window.innerHeight/4);
        _this.aspect = _this.width / _this.height;
	      _this.camera.aspect = _this.aspect;
	      _this.camera.updateProjectionMatrix();
	      _this.renderer.setSize( _this.width, _this.height );
      };
    }(this), false );
  }
}

EyeView.prototype.render = function() {
  if (this.showStats) { this.stats.update(); }
  this.renderer.render( this.scene, this.camera );
}
