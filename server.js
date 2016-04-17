
	
	/* DPENDENXIES */

	var express = require('express');
	var app = express();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);



	



	/* CONFIG */


	// Static files

	app.use('/app', express.static('app'));
	app.use('/assets', express.static('assets'));
	app.use('/views', express.static('views'));



	



	/* ROUTES */


	// Home

	app.get('/', function (req, res)
	{
		res.sendFile(__dirname + '/views/home.html');
	});


	// Game

	app.get('/play', function (req, res)
	{
		res.sendFile(__dirname + '/views/game.html');
	});

	app.get('/test', function (req, res)
	{
		res.sendFile(__dirname + '/views/test.html');
	});
	

	// Launch server

	var port = process.env.PORT || 5000;
	http.listen(port, function ()
	{
		console.log('listening on *:3000');
	});



	



	/* ROOMS */


	var rooms = {};
	var clients = {};
	var games = {};
	
	io.on('connection', function (socket)
	{

		// Store client
		clients[socket.id] = socket;

		// Send room list to new user
		socket.emit('FrontGetRoomsList', rooms);

		// Create room
		socket.on('ServerCreateRoom', function (data)
		{
			// Update rooms on server
			if(!rooms[data.owner])
			{
				rooms[data.owner] = data;
			}

			// Update rooms on clients
			io.emit('FrontCreateRoom', data);
		});

		// Choose room
		socket.on('ServerRoomChoosed', function (data)
		{
			// Room infos
			var game = {
				name: rooms[data.owner].name,
				players: [data.owner, data.opponent],
				owner: data.owner,
				ready: 0,
				state: 0
			};

			// Manage room
			clients[data.owner].join(rooms[data.owner].name);
			clients[data.opponent].join(rooms[data.owner].name);

			// Convert room to game
			games[game.name] = game;
			io.emit('FrontRemoveRoom', rooms[data.owner]);
			delete rooms[data.owner];

			// Set clients rooms
			clients[data.owner].game = game.name;
			clients[data.opponent].game = game.name;

			// Launch game
			io.to(game.name).emit('FrontBeginGame', game);
		});

		// Players are ready
		socket.on('ServerPlayersAreReady', function (data)
		{
			// Check state of room
			if(games[clients[socket.id].game].ready > 0)
			{
				io.to(clients[socket.id].game).emit('FrontPlayersAreReady', { ready: true, start: data.room.owner });
			}
			else
			{
				games[clients[socket.id].game].ready++;
			}
		});

		// Player played
		socket.on('ServerPlayerPlayed', function (data)
		{
			// Relaunch front event
			io.to(data.room.name).emit('FrontPlayerPlayed', data);
		});

		// Player missed
		socket.on('ServerPlayerMissed', function (data)
		{
			// Relaunch from event
			io.to(data.room.name).emit('FrontPlayerMissed', data);
		});

		// Game finished
		socket.on('ServerGameFinished', function (data)
		{
			// Relaunch event
			io.to(data.room.name).emit('FrontGameFinished', data);
		});

		// Disconnect
		socket.on('disconnect', function ()
		{
			// Remove room
			if(rooms[socket.id]){ io.emit('FrontRemoveRoom', rooms[socket.id]); delete rooms[socket.id]; }

			// Remove game
			if(games[clients[socket.id].game])
			{
				// Emit End event
				io.to(clients[socket.id].game).emit('FrontPlayerLeaveGame', {
					game: games[clients[socket.id].game],
					traitor: socket.id
				});

				// Remove game
				delete games[clients[socket.id].game];
				clients[socket.id].game = null;
			}
		});

	});



	