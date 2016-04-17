var SpotLight = function(x,y,z,params)
{
	this.group = new THREE.Group();

	this.config = {
		color 	   : 0xffffff,
		intensity  : 1,
		castShadow : false,
		helper     : false
	};

	$.extend(this.config, params);

	this.light = new THREE.SpotLight(this.config);
	this.light.position.set(x,y,z);

	this.group.add(this.light);

	if(this.config.helper)
	{
		this.spotHelper = new THREE.SpotLightHelper(this.light);
		this.group.add(this.spotHelper);
	}
}