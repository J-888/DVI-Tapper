/*
deadzones zonas:
128
96
64
32
*/
var sprites = {
 Beer: { sx: 512, sy: 99, w: 23, h: 32, frames: 1 },
 Glass: { sx: 512, sy: 131, w: 23, h: 32, frames: 1 },
 NPC: { sx: 512, sy: 66, w: 33, h: 33, frames: 1 },
 ParedIzda: { sx: 0, sy: 0, w: 512, h: 480, frames: 1 },
 Player: { sx: 512, sy: 0, w: 56, h: 66, frames: 1 },
 TapperGameplay: { sx: 0, sy: 480, w: 512, h: 480, frames: 1 }
};

var enemies = {
  straight: { x: 0,   y: -50, sprite: 'enemy_ship', health: 10, 
              E: 100 },
  ltr:      { x: 0,   y: -100, sprite: 'enemy_purple', health: 10, 
              B: 75, C: 1, E: 100, missiles: 2  },
  circle:   { x: 250,   y: -50, sprite: 'enemy_circle', health: 10, 
              A: 0,  B: -100, C: 1, E: 20, F: 100, G: 1, H: Math.PI/2 },
  wiggle:   { x: 100, y: -50, sprite: 'enemy_bee', health: 20, 
              B: 50, C: 4, E: 100, firePercentage: 0.001, missiles: 2 },
  step:     { x: 0,   y: -50, sprite: 'enemy_circle', health: 10,
              B: 150, C: 1.2, E: 75 }
};

var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16,
    OBJECT_DEADZONE = 32;

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase();

  // Only 1 row of stars
  if(ua.match(/android/)) {
    Game.setBoard(0,new Starfield(50,0.6,100,true));
  } else {
    Game.setBoard(0,new Starfield(20,0.4,100,true));
    Game.setBoard(1,new Starfield(50,0.6,100));
    Game.setBoard(2,new Starfield(100,1.0,50));
  }  
  Game.setBoard(3,new TitleScreen("Alien Invasion", 
                                  "Press fire to start playing",
                                  playGame));
};

var level1 = [
 // Start,   End, Gap,  Type,   Override
  [ 0,      4000,  500, 'step' ],
  [ 6000,   13000, 800, 'ltr' ],
  [ 10000,  16000, 400, 'circle' ],
  [ 17800,  20000, 500, 'straight', { x: 50 } ],
  [ 18200,  20000, 500, 'straight', { x: 90 } ],
  [ 18200,  20000, 500, 'straight', { x: 10 } ],
  [ 22000,  25000, 400, 'wiggle', { x: 150 }],
  [ 22000,  25000, 400, 'wiggle', { x: 100 }]
];



var playGame = function() {
  var board = new GameBoard();
  board.add(new TapperBG());
  board.add(new PlayerGame());
  board.add(new Cliente(100, 90, 50));
  board.add(new Deadzone(128 - 23, 90));
  board.add(new Deadzone(96 - 23, 185));
  board.add(new Deadzone(64 - 23, 281));
  board.add(new Deadzone(32 - 23, 377));
  board.add(new Deadzone(325, 90));
  board.add(new Deadzone(357, 185));
  board.add(new Deadzone(389, 281));
  board.add(new Deadzone(421, 377));
  //board.add(new PlayerShip());
  //board.add(new Level(level1,winGame));
  Game.setBoard(1,board);
  //Game.setBoard(5,new GamePoints(0));
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("You win!", 
                                  "Press fire to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(3,new TitleScreen("You lose!", 
                                  "Press fire to play again",
                                  playGame));
};

var Starfield = function(speed,opacity,numStars,clear) {

  // Set up the offscreen canvas
  var stars = document.createElement("canvas");
  stars.width = Game.width; 
  stars.height = Game.height;
  var starCtx = stars.getContext("2d");

  var offset = 0;

  // If the clear option is set, 
  // make the background black instead of transparent
  if(clear) {
    starCtx.fillStyle = "#000";
    starCtx.fillRect(0,0,stars.width,stars.height);
  }

  // Now draw a bunch of random 2 pixel
  // rectangles onto the offscreen canvas
  starCtx.fillStyle = "#FFF";
  starCtx.globalAlpha = opacity;
  for(var i=0;i<numStars;i++) {
    starCtx.fillRect(Math.floor(Math.random()*stars.width),
                     Math.floor(Math.random()*stars.height),
                     2,
                     2);
  }

  // This method is called every frame
  // to draw the starfield onto the canvas
  this.draw = function(ctx) {
    var intOffset = Math.floor(offset);
    var remaining = stars.height - intOffset;

    // Draw the top half of the starfield
    if(intOffset > 0) {
      ctx.drawImage(stars,
                0, remaining,
                stars.width, intOffset,
                0, 0,
                stars.width, intOffset);
    }

    // Draw the bottom half of the starfield
    if(remaining > 0) {
      ctx.drawImage(stars,
              0, 0,
              stars.width, remaining,
              0, intOffset,
              stars.width, remaining);
    }
  };

  // This method is called to update
  // the starfield
  this.step = function(dt) {
    offset += dt * speed;
    offset = offset % stars.height;
  };
};

var TapperBG = function() {
  this.setup('TapperGameplay', {});

  this.x = 0;
  this.y = 0;

  this.step = function(dt) {
  };

};
TapperBG.prototype = new Sprite();

var Deadzone = function(x, y) {
  this.setup('Glass', {});
  this.x = x;
  this.y = y;

  this.step = function(dt) {
  };

};
Deadzone.prototype = new Sprite();
Deadzone.prototype.type = OBJECT_DEADZONE;
// Comment to debug
Deadzone.prototype.draw = function(ctx){};

var Cerveza = function(x, y, velx) {
  this.setup('Beer',{ });

  this.x = x;
  this.y = y;
  // TODO, preguntar porque funciona en setup y fuera
  this.vx = velx;
  this.safeCollision = 8;
  this.exitedDeadzone = false;

  this.step = function(dt) {
  	this.x += this.vx * dt;
  	var collision = this.board.collide(this,OBJECT_ENEMY);

  	if(collision) {
    	this.board.remove(this);
    	this.board.add(new CervezaVacia(this.x,this.y, -this.vx));
    	collision.collisionCerveza();
	}

  	var collision2 = this.board.collide(this,OBJECT_DEADZONE);
  	if(collision2 && this.x < 150){
  		this.board.remove(this);
  	}
  };

};
Cerveza.prototype = new Sprite();
Cerveza.prototype.type = OBJECT_PLAYER_PROJECTILE;

var CervezaVacia = function(x, y, velx) {
  this.setup('Glass',{ });

  this.x = x;
  this.y = y;
  // TODO, preguntar porque funciona en setup y fuera
  this.vx = velx;

  this.step = function(dt) {
  	this.x += this.vx * dt;
  	var collision = this.board.collide(this,OBJECT_DEADZONE);
  	if(collision) {
    	this.board.remove(this);

	} /*else if(this.y < -this.h) { 
	    this.board.remove(this); 
	}*/
  };

};
CervezaVacia.prototype = new Sprite();
CervezaVacia.prototype.type = OBJECT_ENEMY_PROJECTILE;

var Cliente = function(x, y, velx) {
  this.setup('NPC',{ });

  this.x = x;
  this.y = y;
  // TODO, preguntar porque funciona en setup y fuera
  this.vx = velx;
  this.safeCollision = 5;

  this.step = function(dt) {
  	this.x += this.vx * dt;
  	//var collision = this.board.collide(this,OBJECT_PLAYER_PROJECTILE);
  };

  this.collisionCerveza = function(){
  	this.board.remove(this);
  }

};
Cliente.prototype = new Sprite();
Cliente.prototype.type = OBJECT_ENEMY;

var PlayerGame = function() {
  this.setup('Player', {});

  this.x = 325;
  this.y = 90;
  var keyup = true;
  var lastkey = null;

  this.step = function(dt) {
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
  };

};
PlayerGame.prototype = new Sprite();

var PlayerShip = function() { 
  this.setup('ship', { vx: 0, reloadTime: 0.25, maxVel: 200 });

  this.reload = this.reloadTime;
  this.x = Game.width/2 - this.w / 2;
  this.y = Game.height - Game.playerOffset - this.h;

  this.step = function(dt) {
    if(Game.keys['left']) { this.vx = -this.maxVel; }
    else if(Game.keys['right']) { this.vx = this.maxVel; }
    else { this.vx = 0; }

    this.x += this.vx * dt;

    if(this.x < 0) { this.x = 0; }
    else if(this.x > Game.width - this.w) { 
      this.x = Game.width - this.w;
    }

    this.reload-=dt;
    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;

      this.board.add(new PlayerMissile(this.x,this.y+this.h/2));
      this.board.add(new PlayerMissile(this.x+this.w,this.y+this.h/2));
    }
  };
};

PlayerShip.prototype = new Sprite();
PlayerShip.prototype.type = OBJECT_PLAYER;

PlayerShip.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};


var PlayerMissile = function(x,y) {
  this.setup('missile',{ vy: -700, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h; 
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y < -this.h) { 
      this.board.remove(this); 
  }
};


var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0, reloadTime: 0.75, 
                                   reload: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }

  if(Math.random() < 0.01 && this.reload <= 0) {
    this.reload = this.reloadTime;
    if(this.missiles == 2) {
      this.board.add(new EnemyMissile(this.x+this.w-2,this.y+this.h));
      this.board.add(new EnemyMissile(this.x+2,this.y+this.h));
    } else {
      this.board.add(new EnemyMissile(this.x+this.w/2,this.y+this.h));
    }

  }
  this.reload-=dt;

  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w/2, 
                                   this.y + this.h/2));
    }
  }
};

var EnemyMissile = function(x,y) {
  this.setup('enemy_missile',{ vy: 200, damage: 10 });
  this.x = x - this.w/2;
  this.y = y;
};

EnemyMissile.prototype = new Sprite();
EnemyMissile.prototype.type = OBJECT_ENEMY_PROJECTILE;

EnemyMissile.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER)
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y > Game.height) {
      this.board.remove(this); 
  }
};



var Explosion = function(centerX,centerY) {
  this.setup('explosion', { frame: 0 });
  this.x = centerX - this.w/2;
  this.y = centerY - this.h/2;
};

Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt) {
  this.frame++;
  if(this.frame >= 12) {
    this.board.remove(this);
  }
};

window.addEventListener("load", function() {
  //Game.initialize("game",sprites,startGame);
  Game.initialize("game",sprites,playGame);
});


