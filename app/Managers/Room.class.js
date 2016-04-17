

	var Room = function (room, socket)
	{



		/* VARIABLES */


		// Reference

		var that = this;


		// DOM

		this.dom = {};

		this.dom.container = null;
		this.dom.loader = null;

		this.dom.module = { elem: null, goban: null, you: { elem: null, name: null, played: null, captured: null }, opponent: { elem: null, name: null, played: null, captured: null }, miss: null };


		// Game

		this.game = new Game(
		{
			size: 22
		}, 
		function (){ that.finish(); });

		this.goban = null;


		// Room

		this.room = room;

		this.socket = socket;

		this.player = null;


		// Is

		this.is = {};
		this.is.playing = false;
		this.is.turn = false;







		/* METHODS */


		// Ini = nul

		this.init = function (container)
		{

			// Update DOM
			this.dom.container = container;
			this.dom.loader = container.find('.loader');
			this.dom.module.elem = $($('#template-gameplay').html());
			this.dom.module.goban = this.dom.module.elem.find('.goban');
			this.dom.module.you.elem = this.dom.module.elem.find('#you');
			this.dom.module.you.name = this.dom.module.you.elem.find('.player-name');
			this.dom.module.you.played = this.dom.module.you.elem.find('.stones-played .score');
			this.dom.module.you.captured = this.dom.module.you.elem.find('.stones-captured .score');
			this.dom.module.opponent.elem = this.dom.module.elem.find('#opponent');
			this.dom.module.opponent.name = this.dom.module.opponent.elem.find('.player-name');
			this.dom.module.opponent.played = this.dom.module.opponent.elem.find('.stones-played .score');
			this.dom.module.opponent.captured = this.dom.module.opponent.elem.find('.stones-captured .score');
			this.dom.module.miss = this.dom.module.elem.find('#btn-miss-turn');

			// Goban
			this.goban = new Interface(this.dom.module.goban, function (x, y, z)
			{
				that.play(x, y, z);
			});
			this.game.setInterface(this.goban);
			this.goban.create(function ()
			{
				that.socket.emit('ServerPlayersAreReady', {
					room: that.room,
					me: that.socket.id
				});
			});

		};


		// Animations

		this.show = function ()
		{

			// Append
			this.dom.container.append(this.dom.module.elem);

			// Add class
			this.dom.module.elem.addClass('show');

		};


		// Start game

		this.start = function (data)
		{

			// Get player
			if(data.start == this.socket.id){ this.player = 0; this.is.turn = true; }else{ this.player = 1; }

			// Show game
			this.dom.container.addClass('loaded').removeClass('loading');
			$('.logo').addClass('hide');
			this.show();
			setTimeout(function ()
			{
				if(that.is.turn){ that.dom.module.elem.addClass('player-active').removeClass('player-disabled'); }
				else{ that.dom.module.elem.addClass('player-disabled').removeClass('player-active'); }
			}, 1000);

			// Callbacks
			this.dom.module.miss.click(function (e){ e.preventDefault(); that.miss(); })

			// Playing
			this.is.playing = true;

		};


		// Callbacks

		this.play = function (x, y, z)
		{

			if(this.is.turn && !this.game.state[x+10.5][z+10.5])
			{
				// Check ko
				if(this.game.isKo(x+10.5, z+10.5)){ console.log(x + ' | ' + y + ' | ' + z); this.goban.forbidden(x, y, z); }

				// Play
				else
				{
					// Update turn
					this.is.turn = false;
					this.dom.module.elem.addClass('player-disabled').removeClass('player-active');

					// Launch socket
					this.socket.emit('ServerPlayerPlayed', {
						room: that.room,
						id: that.socket.id,
						shot: {x: x, y: y, z: z, player: that.player }
					});
				}
			}

		};

		this.miss = function ()
		{

			if(this.is.turn)
			{
				// Update turn
				this.is.turn = false;
				this.dom.module.elem.addClass('player-disabled').removeClass('player-active');

				if(this.game.passed < 1)
				{
					// Launch socket
					this.socket.emit('ServerPlayerMissed', {
						room: that.room,
						id: that.socket.id
					});
				}
				else
				{
					// Calculate score
					this.game.tally();

					// Emit socket
					this.socket.emit('ServerGameFinished', 
					{
						room: that.room,
						scores: that.game.players
					});
				}
			}

		};






		/* SOCKETS */


		// Players are ready

		this.socket.on('FrontPlayersAreReady', function (data)
		{
			that.start(data);
		});


		// Player played

		this.socket.on('FrontPlayerPlayed', function (data)
		{
			// Play the show
			that.game.onPlay(data.shot.x+10.5, data.shot.z+10.5, data.shot.y);

			// Update scores on interface
			that.dom.module.you.played.html(that.game.players[that.player].pions);
			that.dom.module.you.captured.html(that.game.players[Math.abs(that.player-1)].captured);
			that.dom.module.opponent.played.html(that.game.players[Math.abs(that.player-1)].pions);
			that.dom.module.opponent.captured.html(that.game.players[that.player].captured);

			// Update interface
			if(that.game.currentPlayer == that.player)
			{
				that.dom.module.elem.addClass('player-active').removeClass('player-disabled');
				that.is.turn = true;
			}
		});


		// Player missed

		this.socket.on('FrontPlayerMissed', function (data)
		{

			// Miss the turn
			that.game.onPass();

			// Update interface
			if(that.game.currentPlayer == that.player)
			{
				that.dom.module.elem.addClass('player-active').removeClass('player-disabled');
				that.is.turn = true;
			}

		});


		// Game Finished

		this.socket.on('FrontGameFinished', function (data)
		{
			
			// Create scores
			var scores = {
				you: {
					pions: data.scores[that.player].pions,
					captured: data.scores[Math.abs(that.player-1)].captured,
					territory: data.scores[that.player].points,
				},
				opponent: {
					pions: data.scores[Math.abs(that.player-1)].pions,
					captured: data.scores[that.player].captured,
					territory: data.scores[Math.abs(that.player-1)].points
				}
			};
			scores.you.score = scores.you.pions + scores.you.captured + scores.you.territory;
			scores.opponent.score = scores.opponent.pions + scores.opponent.captured + scores.opponent.territory;

			// Player state
			if(scores.you.score > scores.opponent.score){ scores.state = 'Victoire'; }
			else if(scores.you.score < scores.opponent.score){ scores.state = 'Défaite'; }
			else{ scores.state = "Egalité"; }

			// Fill template
			var elem = $(Mustache.render($('#template-scores').html(), scores));
			that.dom.module.elem.addClass('end');
			setTimeout(function ()
			{
				that.dom.container.append(elem);
				elem.addClass('show'); 
			});

		})


		// Player leaved game

		this.socket.on('FrontPlayerLeaveGame', function (data)
		{

			// Fill template
			var popup = $(Mustache.render($('#template-popup').html(), {content: 'Votre adversaire a malheureusement quitté la partie en cours de jeu. Nous somme désolé pour cet incident. Bonne continuation.'}));
			
			// Show
			that.dom.container.append(popup);
			popup.addClass('show');

		});


	};