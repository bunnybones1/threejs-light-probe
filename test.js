var onReady = function() {
	var View = require('threejs-managed-view').View,
		LightProbe = require('./'),
		CheckerBoardTexture = require('threejs-texture-checkerboard');

	var view = new View({
		stats: true
	});
	var getUrlParam = require('urlparams').getParam;

	//dolly
	var dolly = new THREE.Object3D();
	view.scene.add(dolly);
	dolly.add(view.camera);

	//lights
	var light = new THREE.PointLight(0xffffff, .5);
	light.position.x = 5;
	light.position.y = 30;
	view.scene.add(light);
	var hemisphereLight = new THREE.HemisphereLight(0x7f6f5f, 0x7f0000);
	view.scene.add(hemisphereLight);

	//something to reflect
	var lightMesh = new THREE.Mesh(
		new THREE.SphereGeometry(2, 16, 8),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color(140, 120, 100),
			emissive: new THREE.Color(10, 3, 1)
		})
	)

	lightMesh.position.copy(light.position);
	view.scene.add(lightMesh);

	var platform = new THREE.Mesh(
		new THREE.BoxGeometry(32, 2, 32, 1, 1, 1),
		new THREE.MeshPhongMaterial({
			map: new CheckerBoardTexture(0x7f7f7f, 0xffffff, 16, 16)
		})
	)
	view.scene.add(platform);
	platform.position.y = -2;
	var colors = [
		[0xff7f7f, 0x7f0000],
		[0x7fff7f, 0x007f00],
		[0xffff7f, 0x7f7f00],
		[0x7f7fff, 0x00007f]
	]
	var totalWalls = 4;
	for (var i = totalWalls - 1; i >= 0; i--) {
		var ratio = i / totalWalls;
		var angle = ratio * Math.PI * 2;
		var wall = new THREE.Mesh(
			new THREE.BoxGeometry(2, 32, 32, 1, 1, 1),
			new THREE.MeshPhongMaterial({
				map: new CheckerBoardTexture(colors[i][0], colors[i][1], 16, 16)
			})
		)
		view.scene.add(wall);
		wall.position.y = 15;
		wall.position.x = Math.cos(angle) * 9;
		wall.position.z = Math.sin(angle) * 9;
		wall.rotation.y = angle;
	};


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

		var pos = new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);

		var lightProbe = new LightProbe();
		view.scene.add(lightProbe);
		// lightProbe.update(view.renderer, view.scene);

		var mirrorBall = new THREE.Mesh(
			new THREE.SphereGeometry(1, 32, 16),
			new THREE.MeshPhongMaterial({
				// color: colors[i-1],
				color: new THREE.Color(-.15, -.35, -4),
				// emissive: colors[i-1],
				// wireframe: true,
				combine: THREE.AddOperation,
				envMap : lightProbe.getCubeMap(64, 1 * ratio * ratio * ratio, 3)
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
