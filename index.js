var ConvolutedCubeMap = require('./ConvolutedCubeMap');

function LightProbe(near, far, resolution, type) {
	near = near || .01;
	far = far || 1000;
	resolution = resolution || 128;
	this.bufferType = type || THREE.FloatType;

	THREE.CubeCamera.call(this, near, far, resolution, this.bufferType);

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

module.exports = LightProbe;