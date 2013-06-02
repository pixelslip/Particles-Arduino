window.onload = function(){

	var mode = {
		"FADE" : 1,
		"GRAVITY" : 2
	};

	/* You need to set your ip address */
	var socket = io.connect('SET_YOUR_IP_HERE'); 

	var canvas = document.getElementById('canvas')
	  , ctx = canvas.getContext('2d');

	var width, height, centerX, centerY ;
	var btn_down = false;
	var velocity = 1;
	var color = 'rgba(255,255,255,1)';
	var currentMode = 1;
	var particules = [];

	var Particule = function(x, y, radius, id){
		this.x = x;
		this.y = y;
		this.color = color;
		this.alpha = 1;
		this.vx = (Math.random() * 2 - 1) * velocity;
		this.vy = (Math.random() * 2 - 1) * velocity;
		this.radius = radius || 2;
	};

	Particule.prototype = {
		render: function() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fillStyle = 'rgba('+this.color+','+this.alpha+')';
			ctx.fill();
		},
		update: function() {
			this.x += this.vx;
			
			switch(currentMode)
			{
				case mode.FADE:
					this.y += this.vy;
					this.alpha -= Math.random() * 0.005;
					break;
				case mode.GRAVITY:
					this.y += 3;
					break;
			}
		}
	};

	function generate (cx, cy) {
		var x = cx || Math.random() * width;
		var y = cy || Math.random() * height;
	 	particules.push( new Particule(x, y, 4) );
	}

	function init () {
		onResize();
		$(window).resize(onResize);

		// events
		document.addEventListener('mousedown', function(){btn_down=true;}, false);
		document.addEventListener('mouseup', function(){btn_down=false;}, false);
		$('body').keyup(function(e){
			if (e.keyCode == 32) {
				setMode();
			};
		});

		// Events socket
		socket.on('generate', function(){
			btn_down = true;
		});
		socket.on('stop', function(){
			btn_down = false;
		});
		socket.on('mode', function(){
			setMode();
		});
		socket.on('change', function(e){
			color = e.color.red+','+e.color.green+','+e.color.blue;
		});


		update();
	}

	function update () {
		requestAnimFrame(update);
		//console.log(particules.length);
		if(btn_down) generate(centerX, centerY);

		clearCanvas();
		var particule;
		for(var i=0, max = particules.length; i < max; i++)
		{
			if(typeof particules[i] !== 'undefined'){
				particule = particules[i];
				if(testOut(particule)) {
					particules.splice(particules[i], 1);
				} else {
					particule.update();
					particule.render();
				}
				
			}
		}
	}

	function onResize () {
		width = canvas.width = window.innerWidth;
		height = canvas.height = window.innerHeight;
		centerX = Math.floor(width/2);
		centerY = Math.floor(height/2);

		reset();
		update();
	}

	function setMode () {
		currentMode++;
		if(currentMode > 2) currentMode = 1;
	}

	function clearCanvas () {
		ctx.clearRect(0, 0, width, height);
	}

	function reset() {
		particules = [];
		clearCanvas();
	}

	function testOut(partic){
		if(partic.y > height || partic.y < 0) {
			return true;
		} else if(partic.x > width || partic.x < 0) {
			return true;
		} 
		return false;
	}


	init();

}