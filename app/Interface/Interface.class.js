var Interface = function (elem, onClick)
{

	// Variable
	var selected = false,
		nodeSelected,
		roll,toto,faceSelected ,forbidden_case;

	// Reference
	var that     = this;
	
	// Fields options
	this.f_opts = {
		style : config.game.plateau.style,
		map   : config.game.plateau.map,
		size  : config.game.plateau.size
	}

	this.dom = elem;

	this.loader = new THREE.JSONLoader();

	this.repere  = [];
	this.ray     = [new THREE.Vector3( 0, 1, 0 )];

	this.plateauTest = [];
	this.pawnTab     = [];


	this.compPawn = 0;


	this.toLoad = 0;
	this.loaded = 0;
	this.mapload = false;



	this.activePawn = {};

	// Pour chaque reperes survolé on recupere la position de se repere 
	// Ensuite on positionne le curseur de selection a la meme position x,z
	// Et on dis que le joueur est bien au dessus d'une case jouable
	//
	//
	
	function mouseMove(event)
	{
		event.preventDefault();
		var mouse      = {
			x : ( event.clientX / window.innerWidth ) * 2 - 1,
			y : - ( event.clientY / window.innerHeight ) * 2 + 1
		};
		var vector 	   = new THREE.Vector3( mouse.x, mouse.y, 0.5).unproject(that.go.camera);
		var raycaster  = new THREE.Raycaster( that.go.camera.position, vector.sub( that.go.camera.position ).normalize() );
		var intersects = raycaster.intersectObjects(that.repere,true);
		
		if ( intersects.length > 0 )
		{
			selected     = true;
			nodeSelected = intersects[0].object;
			
			roll.mesh.position.set(nodeSelected.position.x,nodeSelected.position.y+0.8,nodeSelected.position.z);
		} 
		else
		{
			selected = false;
		}
	}




	function mouseDown (e)
	{
		toto = new Date();
	}	





	function mouseUp(e)
	{
		var lol  = new Date();
		var lol2 = lol - toto;
		
		if(lol2 < 300)
		{
			if(selected && e.button == 0)
			{
				for(var i = 0; i < that.ray.length; i++)
				{
					var raycaster  = new THREE.Raycaster(nodeSelected.position, that.ray[i]);		
					var intersects = raycaster.intersectObjects(that.go.scene.children);
					
					if(intersects.length > 0)
					{
						faceSelected  = intersects[0].object.geometry.vertices[intersects[0].face.c];
						onClick(nodeSelected.position.x, faceSelected.y, nodeSelected.position.z);
					}
				}
			}
		}
	}

	 	

	//METHODES
	//
	//

	// Creation de la scene 3D
	this.create = function (onFinish)
	{	

		this.onFinish = onFinish;


		// Initialisation Scene
		this.go = new WebGlScene({},this.dom);
		this.go.init();
		this.go.animate();

		// Initialisation Camera
		this.go.camera.position.set(
			config.cameraInit.position.x,
			config.cameraInit.position.y,
			config.cameraInit.position.z
		);

		// controles de la caméra
		this.controls 				= new THREE.OrbitControls( this.go.camera );
		this.controls.noPan 		= true;
		this.controls.minDistance   = 5;
		this.controls.maxDistance   = 30;
		this.controls.maxPolarAngle = Math.PI/2-0.2; 
		this.controls.update();

		console.log(this.controls.maxPolarAngle );


		this.createMap();

		this.hemi = new THREE.HemisphereLight(0xffffff,0xffffff,0.6);
		this.hemi.castShadow = true;
		this.hemi.color.setHSL( 0.6, 1, 0.6 );
		this.hemi.groundColor.setHSL( 0.095, 1, 0.75 );
		this.hemi.position.set( 0, 500, 0 );
		this.go.scene.add(this.hemi);

		this.dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		this.dirLight.color.setHSL( 0.1, 1, 0.95 );
		this.dirLight.position.set( -1, 1.75, 1 );
		this.dirLight.position.multiplyScalar( 50 );
		this.go.scene.add( this.dirLight );

		this.dirLight.castShadow = true;

		this.dirLight.shadowMapWidth = 2048;
		this.dirLight.shadowMapHeight = 2048;

		var d = 50;

		this.dirLight.shadowCameraLeft = -d;
		this.dirLight.shadowCameraRight = d;
		this.dirLight.shadowCameraTop = d;
		this.dirLight.shadowCameraBottom = -d;

		this.dirLight.shadowCameraFar = 350;
		this.dirLight.shadowBias = -0.0001;
		this.dirLight.shadowDarkness = 0.35;
		this.dirLight.shadowCameraVisible = true

		this.go.scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
		this.go.scene.fog.color.setHSL( 0.6, 0, 1 );



		var vertexShader = document.getElementById( 'vertexShader' ).textContent;
		var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
		var uniforms = {
				topColor: 	 { 
					type: "c",
					value: new THREE.Color( 0xD6322D ) 
				},
				bottomColor: { 
					type: "c",
					value: new THREE.Color( 0x8A201D ) 
				},
				offset:		 { 
					type: "f", 
					value: 33 
				},
				exponent:	 { 
					type: "f", 
					value: 0.6 
				}
		}

		// evenement souris
		elem.on('mousemove'  , mouseMove);
		elem.on('mousedown'  , mouseDown);
		elem.on('mouseup'    , mouseUp);
		
	};





	/*   Create Map   */




	this.createMap = function()
	{

		
		
		/*   Create The Goban   */



		this.create3d(function(mesh)
		{
			that.go.scene.add(mesh);

			that.plateauTest.push(mesh);

				for(var j =0; j< that.f_opts.size;j++)
				{
					for(var i = 0; i<that.f_opts.size;i++)
					{		
						var repere = new Repere(-(that.f_opts.size/2)+0.5+i,-0.5,-(that.f_opts.size/2)+0.5+j,0xffffff,0);
						// console.log('ok');
						that.go.scene.add(repere.mesh)

						// raycast
						var raycaster  = new THREE.Raycaster(repere.mesh.position, new THREE.Vector3( 0, 1, 0 ));		
						var intersects = raycaster.intersectObjects(that.plateauTest);
						
						if(intersects.length > 0)
						{
							var new_repere_pos = intersects[0].object.geometry.vertices[intersects[0].face.c];
							repere.mesh.position.y = new_repere_pos.y - 0.4;
						}
						
						that.repere.push(repere.mesh);
					}
				}

				roll = new Repere(0.5,1,0.2,0x48BA5B,0.5);
				that.go.scene.add(roll.mesh);

				forbidden_case = new Repere(0,-1,0,0x971417,1);
				that.go.scene.add(forbidden_case.mesh);

				that.last_play = new Repere(0,-1,0,0x5C535E,0.6);
				that.go.scene.add(that.last_play.mesh);

		},'plateau_'+this.f_opts.style+'_'+this.f_opts.map+'_'+this.f_opts.size,0,0,0);




		/*   Create the Goban fondations   */


		this.create3d(function(mesh)
		{
			that.go.scene.add(mesh);

		},'socle_lowpoly_test',0,-0,0);		


		/*  Load clouds  */


		this.nuage = new THREE.Group();
		for(var i = 1; i < 5;i++)
		{
			this.create3d(function(mesh)
			{
				that.nuage.add(mesh);
			},'nuage_'+i,0,0,0);
		}



		/* Load additionnal stuff */

	
		this.create3d(function(mesh)
		{
			that.go.scene.add(mesh);

		},'desert',0,0,0);


		that.go.scene.add(that.nuage);
	}








	/* Add Pawn to Game */





	this.play = function (x, y, z, player)
	{
		if(player === 1)
		{
			if(y+0.28 > 0)
				name = config.game.piece.white;
			else
				name = 'white_boat_soldier';
		}
		else
		{
			if(y+0.28 > 0.05)
				name = config.game.piece.black;
			else
				name = 'black_boat_soldier';
		}

		this.create3d(function(mesh)
		{

			mesh.name = 'pawn'+that.compPawn;

			this.activePawn = {
				fin  : mesh.position.y,
				toto : mesh
			}

			that.last_play.mesh.position.set(mesh.position.x,mesh.position.y,mesh.position.z);

			mesh.position.y = 5;

			that.go.scene.add(mesh);
			that.pawnTab.push(mesh);
			
			that.compPawn += 1;

			that.animPawn();

		},name,x,y+0.28,z);
	};




	
	/*  Remove pawns  */





	this.remove = function (x, z)
	{
		var depart 	  = new THREE.Vector3( x, -0.3, z);
		var direction = new THREE.Vector3( 0, 1, 0 );

		var raycaster  = new THREE.Raycaster(depart, direction);		
		var intersects = raycaster.intersectObjects(this.pawnTab);

		if(intersects.length > 0)
		{
			this.go.scene.remove(intersects[0].object);
		}
	};



	/*  show the interdiction to put a pawn  */



	this.forbidden = function(x,y,z)
	{
		var tick = 0;
		var direction = 1;

		forbidden_case.mesh.position.set(x,y,z);
		roll.mesh.position.set(0,-2,0);
		
		var timer = setInterval(function(){ 

			if(tick == 5){
				clearInterval(timer);
				forbidden_case.mesh.position.set(0,-2,0);
			}

			forbidden_case.mesh.position.y += 0.1 * direction;

			tick += 1;
			direction *= -1;

		}, 100);
	}




	/*  Import 3d Model  */




	this.create3d = function(callback,name,x,y,z)
	{

		var that = this;

		this.toLoad ++;

		this.loader.load('/assets/models/'+name+'.json',function(geometry,materials){

			for(var i = 0 ; i < materials.length ; i++)
			{
				materials[i].shading = THREE.FlatShading;
			}

			material = new THREE.MeshFaceMaterial( materials );

    		var mesh = new THREE.SkinnedMesh(geometry, material,false);

   			mesh.position.set(x,y,z);
   			mesh.receiveShadow = true;
   			mesh.castShadow = true;

   			that.loaded++;

   			console.log(that.loaded + ' / ' + that.toLoad);

   		   	callback(mesh);

   		   	if(that.toLoad === that.loaded && !that.mapload)
   			{
   				console.log('fini de charger');

   				that.onFinish();

   				that.animCloud();

   				that.mapload = !that.mapload;
   			}
		});
	}




	this.animPawn = function()
	{
		requestAnimationFrame(that.animPawn);

		if(this.activePawn.toto && this.activePawn.toto.position.y > this.activePawn.fin)
			this.activePawn.toto.position.y -= 0.1;
	}

	var loulilol = 1;

	this.animCloud = function()
	{
		requestAnimationFrame(that.animCloud);

		that.nuage.position.x += 0.01 * loulilol;

		if(loulilol && that.nuage.position.x > 5)
		{
			loulilol = -1;
		}
		else if(that.nuage.position.x < -5){
			loulilol = 1;
		}
	}	


};




	
