var sprites = {
 Beer: { sx: 512, sy: 99, w: 23, h: 32, frames: 1 },
 Glass: { sx: 512, sy: 131, w: 23, h: 32, frames: 1 },
 NPC: { sx: 512, sy: 66, w: 33, h: 33, frames: 1 },
 ParedIzda: { sx: 0, sy: 0, w: 512, h: 480, frames: 1 },
 Player: { sx: 512, sy: 0, w: 56, h: 66, frames: 1 },
 TapperGameplay: { sx: 0, sy: 480, w: 512, h: 480, frames: 1 }
};

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16,
    OBJECT_DEADZONE = 32;

var startGame = function() {
  /*var ua = navigator.userAgent.toLowerCase();
  // Only 1 row of stars
  if(ua.match(/android/)) {
    Game.setBoard(0,new Starfield(50,0.6,100,true));
  }*/

  buildBG();
  buildFG();
  Game.setBoard(3,new TitleScreen("tapper", "Press space to start playing", playGame));
};

var buildBG = function() {
  Game.setBoard(0,new TapperBG());
}

var buildFG = function() {
  Game.setBoard(2, new TapperBGParedIzquierda());
}

var playGame = function() {
  Game.setBoardActive(3, false);
  var board = new GameBoard();

  /*RESET*/
  GameManager.reset();

  /*POINTS*/  
  board.add(new GamePoints());

  /*PLAYER*/
  board.add(new PlayerGame());

  /*CLIENTES*/
  var clienteSpeed1 = new Cliente(0, 0, 40);
  var clienteSpeed2 = new Cliente(0, 0, 50);
  var clienteSpeed3 = new Cliente(0, 0, 60);
  var clienteSpeed4 = new Cliente(0, 0, 70);

  /*SPAWNS*/
  			//Spawn(y, startTime, delay, nClientes, cliente)
  board.add(new Spawn( 90, 0.65 + 0, 3, 2, clienteSpeed1));
  board.add(new Spawn(185, 1.5  + 2, 3, 1, clienteSpeed2));
  board.add(new Spawn(281, 2    + 5, 3, 2, clienteSpeed3));
  board.add(new Spawn(377, 2.5  + 6, 3, 1, clienteSpeed4));

  /*DEADZONES*/
  board.add(new Deadzone(128 - 23, 90, "left"));    //izda
  board.add(new Deadzone(96 - 23, 185, "left"));
  board.add(new Deadzone(64 - 23, 281, "left"));
  board.add(new Deadzone(32 - 23, 377, "left"));
  var pickUpMargin = 15;
  board.add(new Deadzone(325 + pickUpMargin, 90, "right"));     //derecha
  board.add(new Deadzone(357 + pickUpMargin, 185, "right"));
  board.add(new Deadzone(389 + pickUpMargin, 281, "right"));
  board.add(new Deadzone(421 + pickUpMargin, 377, "right"));

  Game.setBoard(1,board);
};

var GameManager = new function() {       
  var started = false;	//not necesary, just for clarification                       
  var totalClientes = 0;
  var currentJarrasVacias = 0;

  this.winGame = function() {
    Game.setBoard(3,new TitleScreen("You win!", "Press space to play again", playGame));
  };

  this.loseGame = function() {
    Game.setBoard(3,new TitleScreen("You lose!", "Press space to play again", playGame));
  };

  this.checkWin = function() {
  	if(started && totalClientes == 0 && currentJarrasVacias == 0)
  		this.winGame();
  }

  this.reset = function() {
    started = false;	//not necesary, just for clarification                       
    totalClientes = 0;
    currentJarrasVacias = 0;
  }

  this.notifyClienteDesatendido = function() {
  	this.loseGame();
  }

  this.notifyJarraRota = function() {
  	this.loseGame();
  }

  this.notifyCervezaDesaprovechada = function() {
  	this.loseGame();
  }

  this.notifyAddClientes = function(nClientes) {
  	totalClientes+= nClientes;
  	started = true;	//not necesary, just for clarification  
  }

  this.notifyClienteServido = function() {
    totalClientes--;
    Game.points += 100;
  }

  this.notifyNuevaJarraVacia = function() {
    currentJarrasVacias++;
  }

  this.notifyJarraVaciaRecogida = function() {
    currentJarrasVacias--;
    Game.points += 100;
    this.checkWin();
  }
};

var TapperBG = function() {
  this.setup('TapperGameplay', {});

  this.x = 0;
  this.y = 0;

  this.step = function(dt) { };
};
TapperBG.prototype = new Sprite();

var TapperBGParedIzquierda = function() {
  this.setup('ParedIzda', {});

  this.x = 0;
  this.y = 0;

  this.step = function(dt) { };
};
TapperBGParedIzquierda.prototype = new Sprite();

var Deadzone = function(x, y, side) {
  this.setup('Glass', {});
  this.x = x;
  this.y = y;
  this.side = side;

  this.step = function(dt) {
  };

};
Deadzone.prototype = new Sprite();
Deadzone.prototype.type = OBJECT_DEADZONE;
Deadzone.prototype.draw = function(ctx){};	// Comment to debug

var Cerveza = function(x, y, velx) {
  this.setup('Beer',{ });

  this.x = x;
  this.y = y;
  this.vx = velx;
  this.exitedDeadzone = false;

  this.step = function(dt) {
  	this.x += this.vx * dt;

  	var collision = this.board.collide(this,OBJECT_ENEMY);
  	if(collision) {
    	this.board.remove(this);
    	this.board.add(new CervezaVacia(this.x,this.y, -this.vx));
    	collision.collisionCerveza();
    	GameManager.notifyNuevaJarraVacia();
	}

  	var collision2 = this.board.collide(this,OBJECT_DEADZONE);
  	if(collision2 && collision2.side === "left"){
  		this.board.remove(this);
    	GameManager.notifyCervezaDesaprovechada();
  	}
  };

};
Cerveza.prototype = new Sprite();
Cerveza.prototype.type = OBJECT_PLAYER_PROJECTILE;

var CervezaVacia = function(x, y, velx) {
  this.setup('Glass',{ });

  this.x = x;
  this.y = y;
  this.vx = velx;

  this.step = function(dt) {
  	this.x += this.vx * dt;

  	var collision = this.board.collide(this,OBJECT_DEADZONE);
  	if(collision && collision.side === "right") {
    	this.board.remove(this);
    	GameManager.notifyJarraRota();
	}

	var collision2 = this.board.collide(this,OBJECT_PLAYER);
  	if(collision2) {
    	this.board.remove(this);
    	GameManager.notifyJarraVaciaRecogida();
	}
  };

};
CervezaVacia.prototype = new Sprite();
CervezaVacia.prototype.type = OBJECT_ENEMY_PROJECTILE;

var Cliente = function(x, y, velx) {
  this.setup('NPC',{ });

  this.x = x;
  this.y = y;
  this.vx = velx;

  this.step = function(dt) {
  	this.x += this.vx * dt;
  	var collision = this.board.collide(this,OBJECT_DEADZONE);
	if(collision && collision.side === "right") {
    	this.board.remove(this);
    	GameManager.notifyClienteDesatendido();
	}

  };

  this.collisionCerveza = function(){
  	this.board.remove(this);
    GameManager.notifyClienteServido();
  }

};
Cliente.prototype = new Sprite();
Cliente.prototype.type = OBJECT_ENEMY;

var Spawn = function(y, startTime, delay, nClientes, cliente) {
  this.x = 0;
  this.y = y;
  this.delay = delay;
  this.nClientes = nClientes;
  this.timeSinceLastSpawn = delay - startTime;
  this.cliente = cliente;
  this.cliente.x = this.x;
  this.cliente.y = this.y;
  GameManager.notifyAddClientes(this.nClientes);

  this.step = function(dt) {
  	if (this.nClientes > 0){
  		this.timeSinceLastSpawn += dt;
  		if(this.timeSinceLastSpawn >= this.delay){
  			this.timeSinceLastSpawn = 0;
  			this.nClientes--;
  			var nuevoCliente = Object.create(this.cliente);
  			this.board.add(nuevoCliente);
  		}
  	}
  };
};
Spawn.prototype.draw = function(ctx){};	// invisible

var PlayerGame = function() {
  this.setup('Player', {});

  this.x = 325;
  this.y = 90;
  var keyup = true;
  var lastkey = null;
  var everSpaceUp = false;

  this.step = function(dt) {
  	if(!everSpaceUp && !Game.keys['espacio'])
  		everSpaceUp = true;

  	if(everSpaceUp){
	  	if(!keyup && !Game.keys[lastkey])
	  		keyup = true;
	  	if(Game.keys['arriba'] && keyup) { 
	  		lastkey = 'arriba';
	  		keyup = false;
	  		if(this.x === 325 && this.y === 90){
	    		this.x = 421;
	    		this.y = 377;
	    	}
	    	else if(this.x === 357 && this.y === 185){
	    		this.x = 325;
	    		this.y = 90;
	    	}
	    	else if(this.x === 389 && this.y === 281){
	    		this.x = 357;
	    		this.y = 185;
	    	}
	    	else if(this.x === 421 && this.y === 377){
	    		this.x = 389;
	    		this.y = 281;
	    	}
	  	}
	    else if(Game.keys['abajo'] && keyup) {
	    	lastkey = 'abajo';
	    	keyup = false;
	    	if(this.x === 325 && this.y === 90){
	    		this.x = 357;
	    		this.y = 185;
	    	}
	    	else if(this.x === 357 && this.y === 185){
	    		this.x = 389;
	    		this.y = 281;
	    	}
	    	else if(this.x === 389 && this.y === 281){
	    		this.x = 421;
	    		this.y = 377;
	    	}
	    	else if(this.x === 421 && this.y === 377){
	    		this.x = 325;
	    		this.y = 90;
	    	}
	    }
	    else if(Game.keys['espacio'] && keyup) {
	      lastkey = 'espacio';
	      keyup = false;
	      //Game.keys['fire'] = false;
	      
	      this.board.add(new Cerveza(this.x - 23,this.y, -50));
	    }
	    else{

	    }
	}
  };

};
PlayerGame.prototype = new Sprite();
PlayerGame.prototype.type = OBJECT_PLAYER;

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
  //Game.initialize("game",sprites,playGame);
});