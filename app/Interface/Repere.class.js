var Repere = function(x,y,z,color,alpha)
{
	this.geometry = new THREE.PlaneBufferGeometry(1,1);
	this.material = new THREE.MeshBasicMaterial(
	{
		color       : color,
		transparent : true,
		opacity     : alpha
	});
	this.mesh     = new THREE.Mesh(this.geometry,this.material);

	this.mesh.rotation.x = -Math.PI/2;
	this.mesh.position.set(x,y,z);
}

		