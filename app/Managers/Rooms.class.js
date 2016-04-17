

	var Rooms = function (socket, callback)
	{




		/* VARIABLES */


		// Reference

		var that = this;


		// Socket

		this.socket = socket;


		// Is

		this.is = {};

		this.is.waiting = false;


		// Rooms

		this.rooms = new Array();


		// Callbacks

		this.onRoomFilled = callback;


		// DOM

		this.dom = {};

		this.dom.container = null;
		this.dom.loader = null;

		this.dom.module = { elem: null, rooms: { elem: null, list: null }, new: { elem: null, form: null, input: null } };







		
		/* METHODS */


		// Init

		this.init = function (container)
		{

			// Get template DOM
			this.dom.container = container;
			this.dom.loader = container.find('.loader');
			this.dom.module.elem = $($('#template-rooms').html());
			this.dom.module.rooms.elem = this.dom.module.elem.find('.module-rooms-list');
			this.dom.module.rooms.list = this.dom.module.rooms.elem.find('ul');
			this.dom.module.new.elem = this.dom.module.elem.find('.module-rooms-new');
			this.dom.module.new.text = this.dom.module.new.elem.find('p');
			this.dom.module.new.form = this.dom.module.new.elem.find('form');
			this.dom.module.new.input = this.dom.module.new.elem.find('input[type=text]');

			// Add room event
			this.dom.module.new.form.submit(function (e)
			{
				e.preventDefault();
				var name = that.dom.module.new.input.val();
				if(name.length > 0 && name.length <= 50)
				{
					// Launch socket
					that.socket.emit('ServerCreateRoom', 
					{
						name: name,
						owner: that.socket.id
					});

					// Add loading
					var loader = that.dom.container.find('.loader');
					loader.attr('data-loading', "En attente d'un adversaire");
					that.hide(function (){ that.dom.container.addClass('loading'); });
					that.is.waiting = true;
				}
				else
				{
					that.dom.module.new.text.html('Le nom de votre room doit posséder entre 1 et 50 caractères').addClass('error');
				}
			});

		};


		// Animations

		this.show = function ()
		{

			// Append
			this.dom.container.append(this.dom.module.elem);

			// Add show class
			this.dom.module.elem.addClass('show');

		};

		this.hide = function (callback)
		{

			// Hide
			this.dom.module.elem.addClass('hide');

			// Remove
			setTimeout(function (){ that.dom.module.elem.remove(); if(callback){ callback(); } }, 800);

		};


		// Manage rooms

		this.add = function (room)
		{

			// Add rom in array
			this.rooms[room.owner] = room;

			// Create template
			var elem = $('<li data-name="' + room.name + '" data-owner="' + room.owner + '"><span>' + room.name + '</span><a href="#" class="btn btn-primary">Play now</li>');

			// Event play
			elem.find('a.btn').click(function (e)
			{
				e.preventDefault();
				that.choose($(this).parent().attr('data-owner'));
			});

			// Append
			this.dom.module.rooms.list.append(elem);

		};


		// Choose room

		this.choose = function (owner)
		{

			// Launch socket
			this.socket.emit('ServerRoomChoosed', { opponent: this.socket.id, owner: owner });

			// Set loading state
			var loader = this.dom.container.find('.loader');
			loader.attr('data-loading', "En attente de l'adversaire");
			this.hide(function (){ that.dom.container.addClass('loading'); });
			this.is.waiting = true;

		};


		// Launch game

		this.launchGame = function (room)
		{

			// Change loading
			this.dom.loader.attr('data-loading', 'Chargement de la partie');

			// Create game manager
			var game = new Room(room, this.socket);
			game.init(this.dom.container);			

		};










		/* EVENTS */


		// Get Rooms List

		this.socket.on('FrontGetRoomsList', function (data)
		{
			
			// Append
			for(i in data){ that.add(data[i]); }

			// Show
			that.show();

		});


		// Create Room

		this.socket.on('FrontCreateRoom', function (data)
		{
			// Add room
			if(!that.is.waiting){ that.add(data); }
		});


		// Remove Room

		this.socket.on('FrontRemoveRoom', function (data)
		{
			
			// Find DOM element
			var elem = that.dom.module.rooms.list.find('li[data-owner=' + data.owner + ']');
			elem.addClass('remove');

			// Remove element after animation
			setTimeout(function (){ elem.remove(); }, 500);

		});


		// Begin Game

		this.socket.on('FrontBeginGame', function (data)
		{
			// Update loader
			that.dom.loader.attr('data-loading', 'Joeur disponible');

			// Wait before launching game
			setTimeout(function (){ that.launchGame(data); }, 3000);
		});




	};