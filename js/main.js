"use strict";
let scene, renderer, camera, stats, effect; // stereo
let model, skeleton, mixer, clock;
// let headCam, domViewL, domViewR, eyeViewL, eyeViewR;
const xAxis = new THREE.Vector3(1,0,0);
const yAxis = new THREE.Vector3(0,1,0);
const zAxis = new THREE.Vector3(0,0,1);

window.addEventListener('load', init);

function init() {

	const container = document.getElementById( 'container' );
	clock = new THREE.Clock();

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xa0a0a0 );
	scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
  
	const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
	hemiLight.position.set( 0, 20, 0 );
	scene.add( hemiLight );

	const dirLight = new THREE.DirectionalLight( 0xffffff );
	dirLight.position.set( 3, 10, 10 );
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 2;
	dirLight.shadow.camera.bottom = - 2;
	dirLight.shadow.camera.left = - 2;
	dirLight.shadow.camera.right = 2;
	dirLight.shadow.camera.near = 0.1;
	dirLight.shadow.camera.far = 40;
	scene.add( dirLight );

	// ground
	const ground = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ),
                                 new THREE.MeshPhongMaterial( { color: 0x999999,
                                                                depthWrite: false } ) );
	ground.rotation.x = - Math.PI / 2;
	ground.receiveShadow = true;
	scene.add( ground );
    
  initVisor();
  
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	container.appendChild( renderer.domElement );

	// camera
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );
	camera.position.set( - 1, 2, 3 );

  // stereo camera
  effect = new StereoEffect( );
  effect.setSize(500, 350);
  
  // controls
	const controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enablePan = false;
	controls.enableZoom = false;
	controls.target.set( 0, 1, 0 );
	controls.update();

	stats = new Stats();
	container.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize );

	const loader = new THREE.GLTFLoader();
	loader.load( 'models/gltf/Xbot.glb', function ( gltf ) {

		model = gltf.scene;
		scene.add( model );

		model.traverse( function ( object ) {
			if ( object.isMesh ) {
        object.castShadow = true;
        object.layers.enableAll();
      }
		} );
    
		skeleton = new THREE.SkeletonHelper( model );
		skeleton.visible = true;
		scene.add( skeleton );

    //----------------------------------------------
    // EYES
    var eyeGeom = new THREE.SphereGeometry(4.0);
    eyeGeom.scale(1.0, 0.75, 1.0);
    var eyeMat = new THREE.MeshBasicMaterial({color: "white"});
    var eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    var eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    //----------------------------------------------
    // STEREO CAMERA
    effect.setEyeSeparation(skeleton.bones[7].position.x -
                            skeleton.bones[8].position.x );
    skeleton.bones[7].add(eyeL);
    skeleton.bones[8].add(eyeR);
    skeleton.bones[7].add(effect.stereo.cameraL);
    skeleton.bones[8].add(effect.stereo.cameraR);
    //----------------------------------------------

    
		const animations = gltf.animations;
		mixer = new THREE.AnimationMixer( model );

		numAnimations = animations.length;

		for ( let i = 0; i !== numAnimations; ++ i ) {

			let clip = animations[ i ];
			const name = clip.name;

			if ( baseActions[ name ] ) {
        
				const action = mixer.clipAction( clip );
				activateAction( action );
				baseActions[ name ].action = action;
				allActions.push( action );

			} else if ( additiveActions[ name ] ) {

				// Make the clip additive and remove the reference frame

				THREE.AnimationUtils.makeClipAdditive( clip );

				if ( clip.name.endsWith( '_pose' ) ) {

					clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 3, 30 );

				}

				const action = mixer.clipAction( clip );
				activateAction( action );
				additiveActions[ name ].action = action;
				allActions.push( action );

			}

		}

		createPanel();

	  animate();

	} );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	// Render loop

	requestAnimationFrame( animate );

	for ( let i = 0; i !== numAnimations; ++ i ) {

		const action = allActions[ i ];
		const clip = action.getClip();
		const settings = baseActions[ clip.name ] || additiveActions[ clip.name ];
		settings.weight = action.getEffectiveWeight();

	}

	// Get the time elapsed since the last frame, used for mixer update

	const mixerUpdateDelta = clock.getDelta();

	// Update the animation mixer, the stats panel, and render this frame

	mixer.update( mixerUpdateDelta );

	stats.update();

	renderer.render( scene, camera );
  
  effect.render( scene );
}
