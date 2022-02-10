"use strict";
let scene, renderer, camera, stats;
let eyeL, camL, viewL, rendererL, statL, ctxL;
let eyeR, camR, viewR, rendererR, statR, ctxR;
let model, animations, skeleton, mixer, clock, stereo;
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
  // scene.fog = new THREE.Fog( 0xa0a0f0, 200, 2000 );
  
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
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.set( -2, 2, 3 );

  // controls
	const controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enablePan = true;
	controls.enableZoom = true;
	controls.target.set( 0, 1.75, 0 );
	controls.update();

	stats = new Stats();
	container.appendChild( stats.dom );

	window.addEventListener( 'resize', onWindowResize );

	const loader = new THREE.GLTFLoader();
	loader.load( 'models/gltf/Xbot.glb', function ( gltf ) {

		model = gltf.scene;
    
		scene.add( model );
    
		model.traverse( function ( object ) {
      // console.log(object.name);
			if ( object.isMesh ) {
        // console.log(object);
        // object.material.wireframe = true;
        // object.material.transparent = true;
        // object.material.opacity = 0.2;
        // object.layers.enableAll();
        // object.layers.disable(1);
        object.castShadow = true;
      }
      else console.log(object);
		} );
    
		skeleton = new THREE.SkeletonHelper( model );
		skeleton.visible = true;
		scene.add( skeleton );

    //----------------------------------------------
    // EYE GEOMETRY
    var eyeGeom = new THREE.SphereGeometry(2.5);
    eyeGeom.scale(1.0, 0.75, 1.0);
    var eyeMat = new THREE.MeshBasicMaterial({color: "white"});
    eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.translateZ(2.25);
    eyeR.translateZ(2.25);
    skeleton.bones[7].add(eyeL);
    skeleton.bones[8].add(eyeR);
    var pupilGeom = new THREE.CircleGeometry(1, 8);
    var pupilMat = new THREE.MeshBasicMaterial({color: "black"});
    var pupilL = new THREE.Mesh(pupilGeom, pupilMat);
    var pupilR = new THREE.Mesh(pupilGeom, pupilMat);
    // pupilL.translateZ(2.5);
    // pupilR.translateZ(2.5);
    // eyeL.add(pupilL);
    // eyeR.add(pupilR);
    
    //----------------------------------------------
    // STEREO CAMERAS
    camL = new THREE.PerspectiveCamera(65, 500/350, 0.1, 5000);
    camR = new THREE.PerspectiveCamera(65, 500/350, 0.1, 5000);
    camL.rotateY(Math.PI);
    camR.rotateY(Math.PI);
    var helpL = new THREE.CameraHelper(camL);
    var helpR = new THREE.CameraHelper(camR);
    scene.add(helpL);
    scene.add(helpR);
    eyeL.add(camL);
    eyeR.add(camR);
    
    var eyeSep = (skeleton.bones[7].position.x -
                  skeleton.bones[8].position.x );
    console.log("eyeSep: ", eyeSep);
    
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
    ctxL = rendererL.domElement.getContext('2d');
    ctxR = rendererR.domElement.getContext('2d');
    console.log(rendererL.domElement);
    console.log(ctxL);
    //----------------------------------------------
    // var sphere = new THREE.SphereGeometry(10);
    // var sphmat = new THREE.MeshBasicMaterial({color: "teal", wireframe: true});
     // var sphmesh = new THREE.Mesh(sphere,sphmat);
    // scene.add(sphmesh);
    
    var ball = new THREE.SphereGeometry(0.5);
    var bmat = new THREE.MeshLambertMaterial({color: "maroon"});
    bmesh = new THREE.Mesh(ball,bmat);
    bmesh.position.set(0, 0, 10);
    scene.add(bmesh);
    
		animations = gltf.animations;
		numAnimations = animations.length;
    console.log(animations);
    
		mixer = new THREE.AnimationMixer( model );
    console.log(mixer);

		for ( let i = 0; i !== numAnimations; ++ i ) {

			let clip = animations[ i ];
			const name = clip.name;
      console.log(clip);

      if ( name == "idle" ) console.log(clip.tracks);
      
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
var saccadePeriod = 0.25;
var T = 0;

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
  T += dt;
	// Update the animation mixer, the stats panel, and render this frame
	mixer.update( dt );
	stats.update();

  bmesh.position.set(2*Math.sin(t), 2+2*Math.cos(t), 10);
  
	renderer.render( scene, camera );

  if (T>=saccadePeriod) {
    var rotL = new THREE.Euler(Math.random(), Math.random());
    var rotR = new THREE.Euler(Math.random(), Math.random());
    eyeL.setRotationFromEuler(rotL);
    eyeR.setRotationFromEuler(rotL);
    eyeL.lookAt(bmesh.position);
    eyeR.lookAt(bmesh.position);
    T = 0;
  }
  rendererL.render( scene, camL );
  rendererR.render( scene, camR );

  // var buffL = ctxL.getImageData(0, 0, 500, 350).data;
  // var buffR = ctxR.getImageData(0, 0, 500, 350).data;
  // var diff  = buffL;
  // var sum = 0;
  // for (var j=0; j<350; ++j) {
  //   for (var i=0; i<500; ++i) {
  //     diff[j*500+i] -= buffR[j*500-i];
  //     sum += diff[j*500+i]*diff[j*500+i];
  //   }
  // }
  // console.log(sqrt(sum));
}
