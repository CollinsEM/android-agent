"use strict";
let scene, renderer, camera, stats;
let eyeL, camL, viewL, rendererL, statL;
let eyeR, camR, viewR, rendererR, statR;
let model, skeleton, mixer, clock, stereo;
let bmesh;
// let headCam, domViewL, domViewR, eyeViewL, eyeViewR;
const xAxis = new THREE.Vector3(1,0,0);
const yAxis = new THREE.Vector3(0,1,0);
const zAxis = new THREE.Vector3(0,0,1);

window.addEventListener('load', init);

let eyePosL = new THREE.Vector3( 4,2,1);
let eyePosR = new THREE.Vector3(-4,2,1);
function init() {

	const container = document.getElementById( 'container' );
	clock = new THREE.Clock();

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xa0a0f0 );
  scene.fog = new THREE.Fog( 0xa0a0f0, 200, 2000 );
  
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
	const ground = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ),
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
      console.log(object.name);
			if ( object.isMesh ) {
        console.log(object);
        // object.material.wireframe = true;
        object.material.transparent = true;
        object.material.opacity = 0.2;
        // object.layers.enableAll();
        // object.layers.disable(1);
        object.castShadow = true;
      }
		} );
    
		skeleton = new THREE.SkeletonHelper( model );
		// skeleton.visible = true;
		// scene.add( skeleton );

    //----------------------------------------------
    // EYE GEOMETRY
    var eyeGeom = new THREE.SphereGeometry(4.0);
    eyeGeom.scale(1.0, 0.75, 1.0);
    var eyeMat = new THREE.MeshBasicMaterial({color: "white",
                                              // wireframe: true,
                                              // transparent: true,
                                              opacity: 0.5 });
    eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    // eyeL.rotateY(Math.PI);
    // eyeR.rotateY(Math.PI);
    skeleton.bones[7].add(eyeL);
    skeleton.bones[8].add(eyeR);
    
    //----------------------------------------------
    // STEREO CAMERAS
    // camL = stereo.cameraL;
    // camR = stereo.cameraR;
    camL = new THREE.PerspectiveCamera(45, 500/350, 0.1, 5000);
    camR = new THREE.PerspectiveCamera(45, 500/350, 0.1, 5000);
    // camL.translateZ(10);
    // camR.translateZ(10);
    camL.rotateY(Math.PI);
    camR.rotateY(Math.PI);
    // camL.matrixAutoUpdate = true;
    // camR.matrixAutoUpdate = true;
    // var helpL = new THREE.CameraHelper(camL);
    // var helpR = new THREE.CameraHelper(camR);
    // scene.add(helpL);
    // scene.add(helpR);
    eyeL.add(camL);
    eyeR.add(camR);
    // skeleton.bones[7].add(camL);
    // skeleton.bones[8].add(camR);
    
    // var eyeSep = (skeleton.bones[7].position.x -
    //               skeleton.bones[8].position.x );
    //----------------------------------------------
    // TF-VISOR
    viewL = tfvis.visor().surface({ name: 'left-eye', tab: 'View' });
    viewR = tfvis.visor().surface({ name: 'right-eye', tab: 'View' });
    rendererL = new THREE.WebGLRenderer();
    rendererR = new THREE.WebGLRenderer();
    rendererL.setSize(500, 350);
    rendererR.setSize(500, 350);
    viewL.drawArea.appendChild(rendererL.domElement);
    viewR.drawArea.appendChild(rendererR.domElement);
    //----------------------------------------------
    // var sphere = new THREE.SphereGeometry(10);
    // var sphmat = new THREE.MeshBasicMaterial({color: "teal", wireframe: true});
    // var sphmesh = new THREE.Mesh(sphere,sphmat);
    // scene.add(sphmesh);
    
    var ball = new THREE.SphereGeometry(0.5);
    var bmat = new THREE.MeshLambertMaterial({color: "maroon"});
    bmesh = new THREE.Mesh(ball,bmat);
    bmesh.position.set(0, 0, 5);
    scene.add(bmesh);
    
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

var t = 0;
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

	const dt = clock.getDelta();
  t += dt;
  
	// Update the animation mixer, the stats panel, and render this frame
	mixer.update( dt );
	stats.update();

  bmesh.position.set(2*Math.sin(t), 2+2*Math.cos(t), 5);
  
	renderer.render( scene, camera );
  
  // eyeL.lookAt(bmesh.position);
  rendererL.render( scene, camL );
  
  // eyeR.lookAt(bmesh.position);
  rendererR.render( scene, camR );
  
}
