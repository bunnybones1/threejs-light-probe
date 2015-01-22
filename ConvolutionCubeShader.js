var ConvolutionCubeShader = {

	uniforms: { "tCube": { type: "t", value: null },
				"blurStrength": { type: "f", value: 0.1 },
				"brightness": { type: "f", value: 0.16666 },
				"tFlip": { type: "f", value: - 1 } },

	vertexShader: [
		require('./glslRotationMatrix'),
		"varying vec3 vWorldPosition;",
		"varying vec3 vWorldPosition2;",
		"varying vec3 vWorldPosition3;",
		"varying vec3 vWorldPosition4;",
		"varying vec3 vWorldPosition5;",
		"varying vec3 vWorldPosition6;",
		"uniform float blurStrength;",

		THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

		"void main() {",

		"	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
		"	vWorldPosition = (worldPosition * rotationMatrix( vec3(1.0, 0.0, 0.0), blurStrength)).xyz;",
		"	vWorldPosition2 = (worldPosition * rotationMatrix( vec3(1.0, 0.0, 0.0), -blurStrength)).xyz;",
		"	vWorldPosition3 = (worldPosition * rotationMatrix( vec3(0.0, 1.0, 0.0), blurStrength)).xyz;",
		"	vWorldPosition4 = (worldPosition * rotationMatrix( vec3(0.0, 1.0, 0.0), -blurStrength)).xyz;",
		"	vWorldPosition5 = (worldPosition * rotationMatrix( vec3(0.0, 0.0, 1.0), blurStrength)).xyz;",
		"	vWorldPosition6 = (worldPosition * rotationMatrix( vec3(0.0, 0.0, 1.0), -blurStrength)).xyz;",

		// "	vWorldPosition.x += blurStrength;",
		// "	vWorldPosition2.x -= blurStrength;",
		// "	vWorldPosition3.y += blurStrength;",
		// "	vWorldPosition4.y -= blurStrength;",
		// "	vWorldPosition5.z += blurStrength;",
		// "	vWorldPosition6.z -= blurStrength;",

		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			THREE.ShaderChunk[ "logdepthbuf_vertex" ],

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform samplerCube tCube;",
		"uniform float tFlip;",
		"uniform float brightness;",

		"varying vec3 vWorldPosition;",
		"varying vec3 vWorldPosition2;",
		"varying vec3 vWorldPosition3;",
		"varying vec3 vWorldPosition4;",
		"varying vec3 vWorldPosition5;",
		"varying vec3 vWorldPosition6;",

		THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

		"void main() {",


		"	#ifdef USE_FAKE_HDRI",
		"		vec4 sample1 = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",
		"		vec3 tempColor = sample1.rgb * ((1.0 - sample1.a) * 255.0 + 1.0);",
		// "		gl_FragColor.rgb = sample1.rgb;",
		"		vec4 sample2 = textureCube( tCube, vec3( tFlip * vWorldPosition2.x, vWorldPosition2.yz ) );",
		"		tempColor += sample2.rgb * ((1.0 - sample2.a) * 255.0 + 1.0);",
		"		vec4 sample3 = textureCube( tCube, vec3( tFlip * vWorldPosition3.x, vWorldPosition3.yz ) );",
		"		tempColor += sample3.rgb * ((1.0 - sample3.a) * 255.0 + 1.0);",
		"		vec4 sample4 = textureCube( tCube, vec3( tFlip * vWorldPosition4.x, vWorldPosition4.yz ) );",
		"		tempColor += sample4.rgb * ((1.0 - sample4.a) * 255.0 + 1.0);",
		"		vec4 sample5 = textureCube( tCube, vec3( tFlip * vWorldPosition6.x, vWorldPosition5.yz ) );",
		"		tempColor += sample5.rgb * ((1.0 - sample5.a) * 255.0 + 1.0);",
		"		vec4 sample6 = textureCube( tCube, vec3( tFlip * vWorldPosition6.x, vWorldPosition6.yz ) );",
		"		tempColor += sample6.rgb * ((1.0 - sample6.a) * 255.0 + 1.0);",
		"		gl_FragColor.rgb = tempColor;",
		"	#else",
		"		gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );",
		"		gl_FragColor += textureCube( tCube, vec3( tFlip * vWorldPosition2.x, vWorldPosition2.yz ) );",
		"		gl_FragColor += textureCube( tCube, vec3( tFlip * vWorldPosition3.x, vWorldPosition3.yz ) );",
		"		gl_FragColor += textureCube( tCube, vec3( tFlip * vWorldPosition4.x, vWorldPosition4.yz ) );",
		"		gl_FragColor += textureCube( tCube, vec3( tFlip * vWorldPosition5.x, vWorldPosition5.yz ) );",
		"		gl_FragColor += textureCube( tCube, vec3( tFlip * vWorldPosition6.x, vWorldPosition6.yz ) );",
		"	#endif",
		"	gl_FragColor *= brightness;",

			THREE.ShaderChunk[ "logdepthbuf_fragment" ],

		// "	gl_FragColor.a = 0.0;",


		"}"

	].join("\n")

}

module.exports = ConvolutionCubeShader;