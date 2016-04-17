

	var Game = function (config, onFinish)
	{



		/* VARIABLES */


		// Reference

		var that = this;


		// Config

		this.config = {};
		this.config = {
			size: 21
		};
		this.config = $.extend(this.config, config);


		// State

		this.state = new Array();
		for(var i=0; i<this.config.size; i++){ this.state[i] = new Array(); for(var j=0; j<this.config.size; j++){ this.state[i][j] = null; } }

		this.removed = new Array();


		// Interface

		this.interface = null;


		// Players

		this.players = [
			{
				color: 'red',
				pions: 0,
				points: 0,
				captured: 0
			},
			{
				color: 'blue',
				pions: 0,
				points: 0,
				captured: 0
			}
		];
		this.currentPlayer = 0;
		this.passed = 0;


		// Sets

		this.chains = new Array();
		this.blocs = new Array();


		// Callback

		this.onFinish = onFinish;





		/* METHODS */


		// Create interface

		this.setInterface = function (interface)
		{

			this.interface = interface;

		};


		// Tally

		this.tally = function ()
		{

			if(this.players[0].pions + this.players[1].pions > 0)
			{	
				// Get blocs
				var currentBloc = 0;
				for(var i=0; i<this.state.length; i++)
				{
					for(var j=0; j<this.state[i].length; j++)
					{

						if(this.state[i][j] == null)
						{
							// Create bloc
							this.createBloc(i, j, currentBloc);
							currentBloc++;
						}

					}
				}

				// Count points
				for(var i=0; i<this.blocs.length; i++)
				{
					if(this.blocs[i].valid){ this.players[this.blocs[i].player].points += this.blocs[i].items; }
				}
			}

		};

		this.createBloc = function (x, y, bloc)
		{

			if(this.state[x][y] == null)
			{
				// Update bloc
				if(!this.blocs[bloc]){ this.blocs[bloc] = { valid: true, player: null, items: 1 }; }
				else{ this.blocs[bloc].items++; }
				this.state[x][y] = true;

				// Get neighbors
				if(this.state[x-1] && typeof(this.state[x-1][y]) != 'undefined'){ this.createBloc(x-1, y, bloc); }
				if(this.state[x+1] && typeof(this.state[x+1][y]) != 'undefined'){ this.createBloc(x+1, y, bloc); }
				if(typeof(this.state[x][y-1]) != 'undefined' && typeof(this.state[x][y-1]) != 'undefined'){ this.createBloc(x, y-1, bloc); }
				if(typeof(this.state[x][y+1]) != 'undefined' && typeof(this.state[x][y+1]) != 'undefined'){ this.createBloc(x, y+1, bloc); }
			}
			else if(typeof(this.state[x][y]) == 'object')
			{
				if(this.blocs[bloc].player == null){ this.blocs[bloc].player = this.state[x][y].player; }
				if(this.blocs[bloc].valid)
				{ 
					if(this.blocs[bloc].player != this.state[x][y].player){ this.blocs[bloc].valid = false; }
				}
			}

		};


		// Ko

		this.isKo = function(x, y)
		{
			console.log(this.removed);
			console.log('x : ' + x + ' | y : ' + y);
			for(var i=0; i<this.removed.length; i++){ if(this.removed[i].x == x && this.removed[i].y == y){ console.log('oui !'); return true; } }
			return false;

		};



		/* EVENTS */

		
		// OnPlay

		this.onPlay = function (x, y, z)
		{

			// Verify if case is empty
			if(that.state[x][y])
			{
				// alert('Vous ne pouvez pas jouer ici car la case est deja prise'); 
			}

			// Play
			else
			{
				// Update state
				that.players[that.currentPlayer].pions++;
				//that.interface.play(x, y, that.players[that.currentPlayer].color);
				that.interface.play(x-10.5, z, y-10.5, that.currentPlayer);
				that.state[x][y] = new Pion(x, y, that.currentPlayer, that);
				that.state[x][y].observe(that.state);
				that.passed = 0;

				// Verify of a potencial taking
				var neighbors = that.state[x][y].getNeighbors();
				var removed = false;
				for(var i in neighbors){ if(neighbors[i].player != that.state[x][y].player){ if(neighbors[i].isTaken(0)){ removed = true; var captured = neighbors[i].removeChain(); that.players[(that.currentPlayer+1)%2].captured += captured; } }}
				if(!removed){ this.removed = new Array(); }

				// Change player
				if(that.currentPlayer == 0){ that.currentPlayer = 1; }else{ that.currentPlayer = 0; } 

			}

		};


		// OnPass

		this.onPass = function ()
		{

			console.log('pass');

			if(this.passed >= 1)
			{
				// Callback
				this.onFinish(this.players); 
			}
			
			else
			{
				// Change player
				if(that.currentPlayer == 0){ that.currentPlayer = 1; }else{ that.currentPlayer = 0; } 

				// Increment passed turns
				this.passed++; 
			}

		};



	};