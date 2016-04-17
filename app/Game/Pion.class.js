

	
	/* CLASS */


	var Pion = function (x, y, player, game)
	{



		/* VARIABLES */


		// Reference

		var that = this;
		this.game = game;


		// Datas

		this.position = {x, y};
		this.player = player;


		// Chain

		this.chain = new Array(that);






		/* METHODS */


		// Get neighbors

		this.getNeighbors = function ()
		{

			// Position
			var x = this.position.x;
			var y = this.position.y;

			// Get neighbors
			var neighbors = new Array();
			if(this.game.state[x-1]){ if(game.state[x-1][y]){ neighbors.push(this.game.state[x-1][y]) } }
			if(this.game.state[x+1]){ if(game.state[x+1][y]){ neighbors.push(this.game.state[x+1][y]) } }
			if(this.game.state[x][y-1]){ neighbors.push(this.game.state[x][y-1]) }
			if(this.game.state[x][y+1]){ neighbors.push(this.game.state[x][y+1]) }

			// Return
			return neighbors;

		};


		// Get borders

		this.getBorders = function ()
		{

			// Position
			var x = this.position.x;
			var y = this.position.y;

			// Get borders
			var borders = 0;
			if(typeof(this.game.state[x-1]) == 'undefined'){ borders++; }
			if(typeof(this.game.state[x+1]) == 'undefined'){ borders++; }
			if(typeof(this.game.state[x][y-1]) == 'undefined'){ borders++; }
			if(typeof(this.game.state[x][y+1]) == 'undefined'){ borders++; }

			// Return
			return borders;

		};


		// Observe

		this.observe = function (state)
		{

			// Get neighbors
			var neighbors = that.getNeighbors();

			// Chain
			for(i in neighbors)
			{
				if(neighbors[i].player == that.player)
				{
					that.chain = that.chain.concat(neighbors[i].chain);
				}
			}

			// Update chains
			for(i in that.chain)
			{
				that.chain[i].chain = that.chain;
			}

		};


		// Is Taken

		this.isTaken = function (i)
		{

			if(i == this.chain.length){ return true; }
			var neighbors = this.chain[i].getNeighbors();
			var borders = this.chain[i].getBorders();
			if(neighbors.length < 4 - borders){ return false; }else{ i = i+1; return this.isTaken(i); }

		};


		// Remove Chain

		this.removeChain = function ()
		{

			// Update game removed property
			this.game.removed = new Array();

			// Loop on chain
			for(i in this.chain)
			{
				// Add in removed
				this.game.removed.push({x: that.chain[i].position.x, y: that.chain[i].position.y});

				// Remove
				this.game.interface.remove(this.chain[i].position.x-10.5, this.chain[i].position.y-10.5);
				this.game.state[this.chain[i].position.x][this.chain[i].position.y] = null;
			}

			// Return length
			return this.chain.length;

		};




	};






	/* STATICS */





	