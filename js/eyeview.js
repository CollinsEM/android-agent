class EyeView {
  constructor(id, showStats, scene, camera) {
    this.id = id;
    this.container = document.getElementById(this.id);
    this.showStats = ( showStats !== undefined ? showStats : true );
    
    // Scene
	  this.scene = ( scene !== undefined ? scene : new THREE.Scene() );
	  // this.scene.fog = new THREE.Fog( 0x000000, 20, 35 );

	  // Camera
    this.width = Math.ceil(window.innerWidth/4);
    this.height = Math.ceil(window.innerHeight/4);
    this.aspect = this.width / this.height;
	  this.camera = ( camera !== undefined ? camera :
                    new THREE.PerspectiveCamera( 27, this.aspect, 0.1, 350 ) );
    // this.camera.up.set(0, 0, 1);
	  // this.camera.position.set( 0, 0, -30 );
    
    // Raycaster
    this.raycaster = new THREE.Raycaster();
    
	  // Renderer
	  this.renderer = new THREE.WebGLRenderer( { antialias: false } );
 	  // this.renderer.setClearColor( this.scene.fog.color, 1 );
 	  // this.renderer.setClearColor( 0xffffff, 1 );
	  this.renderer.setPixelRatio( window.devicePixelRatio );
	  this.renderer.setSize( this.width, this.height );
    this.renderer.autoClear = false;
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
