var upgradeFragmentShaderToHaveFakeHDRIOutput = require('./upgradeFragmentShaderToHaveFakeHDRIOutput');

function ConvolutedCubeMap(sourceCubMap, resolution, blurStrength, iterations, flipX, type, prerenderCallback, postrenderCallback) {
	resolution = resolution || 64;
	this.iterations = iterations || 2;
	this.blurStrength = blurStrength || .5;
	type = type || THREE.FloatType;
	var format, useFakeHDRI;
	if(type == ConvolutedCubeMap.FakeHDRI) {
		useFakeHDRI = true;
		type = THREE.UnsignedByteType;
		format = THREE.RGBAFormat;
	}
	this.useFakeHDRI = useFakeHDRI;
	flipX = (flipX === false) ? 1 : -1;
	this.sourceCubMap = sourceCubMap;
	this.prerenderCallback = prerenderCallback;
	this.postrenderCallback = postrenderCallback;

	this.scene = new THREE.Scene();

	this.shader = require('./ConvolutionCubeShader');
	var fragmentShader = upgradeFragmentShaderToHaveFakeHDRIOutput(this.shader.fragmentShader);
	this.cubeMapToRerender = this.shader.uniforms["tCube"];
	this.shader.uniforms["tFlip"].value = flipX;
	this.shader.uniforms["brightness"].value = .16666;
	this.shader.uniforms["blurStrength"].value = this.blurStrength;
	this.cubeMapToRerender.value = sourceCubMap;

	var material = this.material = new THREE.ShaderMaterial( {
		fragmentShader: fragmentShader,
		vertexShader: this.shader.vertexShader,
		uniforms: this.shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide,
		defines: useFakeHDRI ? {
			USE_FAKE_HDRI: true
		} : {},
		// transparent: true
	} );
	var material2 = this.material2 = new THREE.ShaderMaterial( {
		fragmentShader: this.shader.fragmentShader,
		vertexShader: this.shader.vertexShader,
		uniforms: this.shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide,
		defines: useFakeHDRI ? {
			USE_FAKE_HDRI: true
		} : {},
		// transparent: true
	} );

	this.mesh = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), material );
	this.scene.add( this.mesh );

	this.cameraA = new THREE.CubeCamera(.01, 2, resolution, type, format);
	this.cameraB = new THREE.CubeCamera(.01, 2, resolution, type, format);
	this.scene.add(this.cameraA);
	this.scene.add(this.cameraB);
	this.cubeMap = this.cameraB.renderTarget;
}

ConvolutedCubeMap.prototype = {
	update: function(renderer) {
		if(this.prerenderCallback) {
			this.prerenderCallback();
		}
		this.shader.uniforms["blurStrength"].value = this.blurStrength;
		this.cubeMapToRerender.value = this.sourceCubMap;
		this.mesh.material = this.material;
		for (var i = this.iterations; i >= 0; i--) {
			this.cameraA.updateCubeMap(renderer, this.scene);
			this.cubeMapToRerender.value = this.cameraA.renderTarget;
			this.shader.uniforms["blurStrength"].value *= .6666;
			if(this.useFakeHDRI && i == 0) this.mesh.material = this.material2;
			this.cameraB.updateCubeMap(renderer, this.scene);
			this.cubeMapToRerender.value = this.cameraB.renderTarget;
			this.shader.uniforms["blurStrength"].value *= .6666;
		};
		if(this.postrenderCallback) {
			this.postrenderCallback();
		}
	}
}

ConvolutedCubeMap.FakeHDRI = 10090;

module.exports = ConvolutedCubeMap;