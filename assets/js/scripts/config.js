var config = {

	//config Camera
	cameraInit :
	{
		
		position :
		{
			x : 27.12,
			y : 8.72,
			z : 4.46
		}
	},

	//config Lights

	pointLight : 
	{
		position : 
		{
			x : 0,
			y : 20,	
			z : 0
		},
		color : 0xffffff,
		intensity : 2,
		distance  : 50
	},

	// game
	game : 
	{
		piece : 
		{
			black : 'black_basic_soldier',
			white : 'white_basic_soldier'
		},
		tour : 'white',

		plateau : 
		{
			size  : 22,
			style : 'lowpoly',
			map   : 'japon'
		}
	}
};