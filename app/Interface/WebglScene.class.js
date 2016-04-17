var WebGlScene = function (params,dom)
{

	/* VARIABLES */


	// Reference

	var that = this;

	// Params

	this.config = {
		
		//camera options
		cameraFov: 75,
		cameraRatio: window.innerWidth/window.innerHeight,
		cameraFocal: 0.1,
		cameraDistance: 1000,
		rendererAlpha : true
	};
	$.extend(this.config, params);


	//DOM

	this.dom = {};
	this.dom.container = dom;

	// Scene

	this.scene  = new THREE.Scene();

	// Renderer

	this.renderer = new THREE.WebGLRenderer({
		alpha : this.config.rendererAlpha
	});




	this.renderer.gammaInput = true;
	this.renderer.gammaOutput = true;
	// this.renderer.shadowMapEnabled = true;
	// this.renderer.shadowMapCullFace = THREE.CullFaceBack;
	this.renderer.setSize(window.innerWidth,window.innerHeight);
	
	// Camera

	this.camera = new THREE.PerspectiveCamera(
		this.config.cameraFov,
		this.config.cameraRatio,
		this.config.cameraFocal,
		this.config.cameraDistance
	);


	/* COMPOSER */
	
	this.antialias = false;
	this.pixel_ratio = window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1;
	var render_pass  = new THREE.RenderPass(this.scene,this.camera);
	var fxaa_pass    = new THREE.ShaderPass(THREE.FXAAShader);

	fxaa_pass.uniforms.resolution.value.set(1/(window.innerWidth * this.pixel_ratio), 1 / (window.innerHeight * this.pixel_ratio)); 

	fxaa_pass.renderToScreen = true;

	this.composer = new THREE.EffectComposer(this.renderer);
	this.composer.setSize(window.innerWidth * this.pixel_ratio, window.innerHeight * this.pixel_ratio );
	this.composer.addPass( render_pass );
	this.composer.addPass( fxaa_pass );

	// METHODS

	$(window).on('resize', resize);

	function resize()
	{
		that.renderer.setSize(window.innerWidth * that.pixel_ratio ,window.innerHeight * that.pixel_ratio);
		that.composer.setSize(window.innerWidth * that.pixel_ratio ,window.innerHeight * that.pixel_ratio);
		
		fxaa_pass.uniforms.resolution.value.set(1/(window.innerWidth * that.pixel_ratio), 1 / (window.innerHeight * that.pixel_ratio)); 


		that.camera.aspect = window.innerWidth/window.innerHeight;
		that.camera.updateProjectionMatrix();
	}

	this.init = function()
	{
		console.log('init');
		this.dom.container.append(this.renderer.domElement);
	}

	this.animate = function()
	{
		requestAnimationFrame( that.animate );

		that.camera.lookAt( new THREE.Vector3() );
		if(that.antialias)
			that.composer.render();
		else
			that.renderer.render(that.scene, that.camera);
		
		//render();
	}
};