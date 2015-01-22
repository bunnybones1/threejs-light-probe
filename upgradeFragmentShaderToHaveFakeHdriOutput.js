function upgradeFragmentShaderToHaveFakeHDRIOutput(fragmentShader) {
	var indexOfEndOfFragmentShader = fragmentShader.lastIndexOf('}');
	var upgradeEnd = [
		'#ifdef USE_FAKE_HDRI',
		'	float fhdri_brightness = ceil(min(256.0, max(gl_FragColor.r, max(gl_FragColor.g, max(gl_FragColor.b, 1.0)))));',
		'	if(fhdri_brightness > 1.0) {',
		'		gl_FragColor.rgb /= fhdri_brightness;',
		'	}',
		'	gl_FragColor.a = 1.0 - ((fhdri_brightness - 1.0) / 255.0);',
		'#endif',
	].join('\n');
	fragmentShader = fragmentShader.substring(0, indexOfEndOfFragmentShader) + upgradeEnd + '\n}'

	return fragmentShader;
}
module.exports = upgradeFragmentShaderToHaveFakeHDRIOutput;