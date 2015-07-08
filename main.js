// Initialuze Phaser with a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

//mainState contains the game
var mainState = {

	preload: function() {
		//This is executed at beginning of game
		//Game assets would be loaded here

		//Change background color
		game.stage.backgroundColor = '#71c5cf';

		//Load bird sprite (i.e. our character)
		game.load.image('bird', 'assets/bird.png');

		//Load pipe image
		game.load.image('pipe', 'assets/pipe.png');

		game.load.audio('jump', 'assets/jump.wav');

	},

	create: function() {
		//This is called after preload
		//Game set up, sprites displayed, etc.

		//Set physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//Display bird
		this.bird = this.game.add.sprite(100, 245, 'bird');

		//Set gravity to make bird fall
		game.physics.arcade.enable(this.bird);
		this.bird.body.gravity.y = 1000;

		//Call 'jump' func when spacebar is pressed
		var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.add(this.jump, this);

		//Create group of pipes
		this.pipes = game.add.group();
		//Give group of pipes physics
		this.pipes.enableBody = true;
		//Create 20 pipes
		this.pipes.createMultiple(20, 'pipe');

		//Add row of pipes every 1.5 seconds
		this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

		//Scoring
		this.score = 0;
		this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });

		this.bird.anchor.setTo(-0.2, 0.5);

		//Add jump sound to game
		this.jumpSound = game.add.audio('jump');
	},

	update: function() {
		//Called 60 times per second
		//Game logic contained here

		//If bird is out of world boundary, restart game
		if (this.bird.inWorld == false)
			this.restartGame();

		//Restart game on collision
		game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

		//Change angle slowly over time
		if (this.bird.angle < 20)
			this.bird.angle += 1;
	},

	//Function to control jump
	jump: function() {
		if (this.bird.alive == false)
			return;

		//Add vertical velocity to bird
		this.bird.body.velocity.y = -350;

		//Create animation for bird
		var animation = game.add.tween(this.bird);

		//Set animation to change angle to -20 over 100 ms
		animation.to({angle: -20}, 100);

		//Start animation
		animation.start();

		this.jumpSound.play();

		//game.add.tween(this.bird).to({angle: -20}, 100).start();
	},

	//Func to restart game
	restartGame: function() { 
		//Start the 'main' state, restarting the game
		game.state.start('main');
	},

	addOnePipe: function(x, y) {
		//Get first dead pipe in group
		var pipe = this.pipes.getFirstDead();
		//Set new position of the pipe
		pipe.reset(x, y);
		//Add velocity to make pipe move to the left
		pipe.body.velocity.x = -200;
		//Kill pipe when out of sight
		pipe.checkWorldBounds = true;
		pipe.outOfBoundsKill = true;
	},

	addRowOfPipes: function() {
	//Pick where holes between pipes will be
	var hole = Math.floor(Math.random() * 5) + 1;
	this.score += 1;
	this.labelScore.text = this.score;
	//Add 6 pipes
	for (var i = 0; i < 8; i++) 
		if (i != hole && i != hole + 1) {
			this.addOnePipe(400, i * 60 + 10);
			
		}

	
	},

	hitPipe: function() {
		//If bird has already hit pipe, nothing to do
		if (this.bird.alive == false)
			return;

		//Set alive prop to false i.e. bird is dead
		this.bird.alive = false;

		//Stop new pipes from appearing
		game.time.events.remove(this.timer);

		//Go through all the pipes and stop movement
		this.pipes.forEachAlive(function(p) {
			p.body.velocity.x = 0;
		}, this);
	},

};

game.state.add('main', mainState);
game.state.start('main');