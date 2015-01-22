var onReady = function() {
	var View = require('threejs-managed-view').View,
		LightProbe = require('./'),
		CheckerRoom = require('threejs-checkerroom');

	var view = new View({
		stats: true
	});
	var getUrlParam = require('urlparams').getParam;

	//dolly
	var dolly = new THREE.Object3D();
	view.scene.add(dolly);
	// view.camera.position.z = 10;
	dolly.add(view.camera);

	//lights
	var light = new THREE.PointLight(0xffffff, .5);
	light.position.x = 5;
	light.position.y = 30;
	view.scene.add(light);
	var hemisphereLight = new THREE.HemisphereLight(0x7f6f5f, 0x7f0000);
	view.scene.add(hemisphereLight);

	var useFakeHDRI = true;
	//something to reflect
	var lightMesh = new THREE.Mesh(
		new THREE.SphereGeometry(2, 16, 8),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color(140, 90, 20),
			emissive: new THREE.Color(1, 1, 1),
			useFakeHDRI: useFakeHDRI
		})
	)

	lightMesh.position.copy(light.position);
	view.scene.add(lightMesh);

	var checkerRoom = new CheckerRoom(20, 20, 4);
	view.scene.add(checkerRoom);

	//test mirror ball

	var distance = 2;
	var total = 6;
	var lightProbes = [];
	var colors = [
		0xef7f7f,
		0xefef7f,
		0x7fef7f,
		0x7fefef,
		0x7f7fef,
		0xef7fef
	]
	for (var i = total; i > 0; i--) {
		var ratio = i / total;
		var angle = ratio * Math.PI * 2;

		var pos = new THREE.Vector3(Math.cos(angle) * distance, 1, Math.sin(angle) * distance);

		var lightProbe = new LightProbe(undefined, undefined, undefined, useFakeHDRI ? LightProbe.FakeHDRI : THREE.FloatType);
		view.scene.add(lightProbe);
		// lightProbe.update(view.renderer, view.scene);

		var mirrorBall = new THREE.Mesh(
			new THREE.SphereGeometry(1, 32, 16),
			new THREE.MeshPhongMaterial({
				// color: colors[i-1],
				color: 0x000000,
				// color: new THREE.Color(-.15, -.35, -4),
				// emissive: colors[i-1],
				// wireframe: true,
				// useFakeHDRI: true,
				combine: THREE.AddOperation,
				envMap : lightProbe.getCubeMap(64, 1 * ratio * ratio * ratio, 3, false)
			})
		)

		view.scene.add(mirrorBall);
		mirrorBall.position.copy(pos);
		lightProbe.position.copy(pos);
		lightProbe.update(view.renderer, view.scene);
		lightProbes.push(lightProbe);
	};


	for (var i = total-1; i >= 0; i--) {
		lightProbes[i].update(view.renderer, view.scene);
	}


	view.renderManager.onEnterFrame.add(function() {
		dolly.rotation.y += .005;
		for (var i = lightProbes.length - 1; i >= 0; i--) {
			lightProbes[i].update(view.renderer, view.scene);
		};
		lightMesh.position.y = 10 * Math.sin((new Date()).getTime() * .001) + 11;
	})

}

var loadAndRunScripts = require('loadandrunscripts');
loadAndRunScripts(
	[
		'lib/three.js',
		'lib/stats.min.js',
		'lib/threex.rendererstats.js',
	],
	onReady
);
