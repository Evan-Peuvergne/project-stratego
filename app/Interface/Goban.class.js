	
	
	var Goban = function (elem, game)
	{



		/* VARIABLES */


		// Reference

		var that = this;

		this.game = game;


		// DOM

		this.dom = {};
		this.dom.elem = elem;
		this.dom.cases = null;


		// Callbacks

		this.onPlay = null;
		this.onPass = null;




		/* METHODS */


		// Init

		this.init = function (size, callback)
		{
		
			// Create cases
			console.log(this.dom.elem);
			this.dom.elem.width(size*30);
			for(var i=0; i<size; i++)
			{
				var e = $('<div></div>');
				for(var j=0; j<size; j++)
				{
					e.append($('<div></div>'));
				}
				this.dom.elem.append(e);
			}

			// Add event
			this.dom.cases = this.dom.elem.find('> div > div');
			this.dom.cases.click(function (e)
			{
				e.preventDefault();
				var x = $(this).index();
				var y = $(this).parent().index();
				if(that.onPlay){ that.onPlay(x, y); } 
			});

			// Callback
			if(callback){ callback(); }

		};


		// Give case

		this.giveCase = function (x, y)
		{

			return this.dom.elem.find('> div:nth-child(' + (y+1) + ') > div:nth-child(' + (x+1) + ')');

		};


		// Play

		this.play = function (x, y, color)
		{

			this.giveCase(x, y).css({ 'background-color': color });

		};


		// Remove

		this.remove = function (x, y)
		{

			this.giveCase(x, y).css({ 'background-color': 'transparent' });

		};




	};
