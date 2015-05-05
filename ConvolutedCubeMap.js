var upgradeFragmentShaderToHaveFakeHDRIOutput = require('./upgradeFragmentShaderToHaveFakeHdriOutput');
var cloneDeep = require('lodash.clonedeep');

function ConvolutedCubeMap(sourceCubMap, resolution, blurStrength, brightness, iterations, flipX, type, prerenderCallback, postrenderCallback) {
	resolution = resolution || 64;
	this.iterations = iterations || 2;
	this.blurStrength = blurStrength || .5;
	this.brightness = brightness || 1;
	type = type || THREE.FloatType;
	var format, useFakeHDRI;
	var useFakeHDRIThrough = false;
	if(type === ConvolutedCubeMap.FakeHDRI || type === ConvolutedCubeMap.FakeHDRIThrough) {
		useFakeHDRI = true;
		useFakeHDRIThrough = type === ConvolutedCubeMap.FakeHDRIThrough;

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
	var uniforms = this.uniforms = cloneDeep(this.shader.uniforms); //clone uniforms for this instance

	this.cubeMapToRerender = uniforms["tCube"];
	uniforms["tFlip"].value = flipX;
	uniforms["brightness"].value = .16666 * this.brightness;
	uniforms["blurStrength"].value = this.blurStrength;
	this.cubeMapToRerender.value = sourceCubMap;

	var material = this.material = new THREE.ShaderMaterial( {
		fragmentShader: fragmentShader,
		vertexShader: this.shader.vertexShader,
		uniforms: uniforms,
		depthWrite: false,
		side: THREE.BackSide,
		defines: useFakeHDRI ? {
			USE_FAKE_HDRI: true
		} : {},
		// transparent: true
	} );
	var material2;
	if(useFakeHDRIThrough) {
		material2 = this.material2 = material;
	} else {
		material2 = this.material2 = new THREE.ShaderMaterial( {
			fragmentShader: this.shader.fragmentShader,
			vertexShader: this.shader.vertexShader,
			uniforms: uniforms,
			depthWrite: false,
			side: THREE.BackSide,
			defines: useFakeHDRI ? {
				USE_FAKE_HDRI: true
			} : {},
			// transparent: true
		});
	}

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
		this.uniforms["blurStrength"].value = this.blurStrength;
		this.cubeMapToRerender.value = this.sourceCubMap;
		this.mesh.material = this.material;
		for (var i = this.iterations; i >= 0; i--) {
			this.cameraA.updateCubeMap(renderer, this.scene);
			this.cubeMapToRerender.value = this.cameraA.renderTarget;
			this.uniforms["blurStrength"].value *= .6666;
			if(this.useFakeHDRI && i == 0) this.mesh.material = this.material2;
			this.cameraB.updateCubeMap(renderer, this.scene);
			this.cubeMapToRerender.value = this.cameraB.renderTarget;
			this.uniforms["blurStrength"].value *= .6666;
		};
		if(this.postrenderCallback) {
			this.postrenderCallback();
		}
	},
	setBrightness: function(val) {
		this.brightness = val;
		this.uniforms.brightness.value = .16666 * this.brightness;
	}
}

ConvolutedCubeMap.FakeHDRI = 10090;
ConvolutedCubeMap.FakeHDRIThrough = 10091;

module.exports = ConvolutedCubeMap;