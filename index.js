var ConvolutedCubeMap = require('./ConvolutedCubeMap');
var upgradeFragmentShaderToHaveFakeHDRIOutput = require('./upgradeFragmentShaderToHaveFakeHDRIOutput');
//awesome shim to empower native materials with fake 8bit hdri hack for mobile
var materialsToUpgrage = [
	'basic',
	'phong'
];
materialsToUpgrage.forEach(function(mat) {
	var shader = THREE.ShaderLib[mat];
	shader.fragmentShader = upgradeFragmentShaderToHaveFakeHDRIOutput(shader.fragmentShader);
});

console.warn('warning: THREEjs has been shimmed with extra shader routines to provide HDRI emulation via the alpha channel. This may break certain expected behaviours.');

//end shim

function LightProbe(near, far, resolution, type) {
	near = near || .01;
	far = far || 1000;
	resolution = resolution || 128;
	this.bufferType = type;
	var format;
	if(type == ConvolutedCubeMap.FakeHDRI) {
		type = THREE.UnsignedByteType;
		format = THREE.RGBAFormat;
	}
	THREE.CubeCamera.call(this, near, far, resolution, type, format);

	if(this.renderTarget.type !== this.bufferType) console.log("LightProbe: WARNING: This version of three.js does not support Float Type CubeCamera. This is OK, but if you use a patched version of threejs, cubemaps can be HDRI!");

	this.convolutedCubeMaps = [];
}

LightProbe.prototype = Object.create(THREE.CubeCamera.prototype);

LightProbe.prototype.update = function(renderer, scene, updateAllconvolutionCubeMaps) {
	this.updateCubeMap(renderer, scene);
	if(updateAllconvolutionCubeMaps !== false) {
		for (var i = this.convolutedCubeMaps.length - 1; i >= 0; i--) {
			this.convolutedCubeMaps[i].update(renderer);
		};
	}
}

LightProbe.prototype.getCubeMap = function(resolution, blurStrength, iterations, flipX, prerenderCallback, postrenderCallback) {
	var convolutedCubeMap = new ConvolutedCubeMap(this.renderTarget, resolution, blurStrength, iterations, flipX, this.bufferType, prerenderCallback, postrenderCallback);
	this.convolutedCubeMaps.push(convolutedCubeMap);
	convolutedCubeMap.cubeMap.convoluter = convolutedCubeMap;
	convolutedCubeMap.cubeMap.update = convolutedCubeMap.update.bind(convolutedCubeMap);
	return convolutedCubeMap.cubeMap;
}

LightProbe.FakeHDRI = ConvolutedCubeMap.FakeHDRI;

module.exports = LightProbe;