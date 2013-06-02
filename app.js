var five = require("johnny-five")
  , io
  , board;

io = require("socket.io").listen(3000);
board = new five.Board({ port : "/dev/tty.usbmodemfa121" });

board.on("ready", function(){

	var button_generate
	  , button_mode
	  , potentio
	  , color;

	button_generate = new five.Button({ pin: 6, invert: true});
	button_mode    = new five.Button({ pin: 7, invert: true});
    
    potentio = new five.Sensor({
    	pin : "A3",
    	freq : 250
    });
    
    button_generate.on("down", function(){
    	board.emit('generate');
    });
    button_generate.on("up", function(){
    	board.emit('stop');
    });
    
    button_mode.on("down", function(){
    	board.emit('mode');
    });

    potentio.on("read", function(err, value){
    	temp = parseInt(this.normalized);
   		color = hsvToRgb(temp, 100, 100);
  
    	board.emit('change', { red:color.red, green:color.green, blue:color.blue });
    });

});

function hsvToRgb(h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;
	

	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));
	
	s /= 100;
	v /= 100;
	
	if(s == 0) {
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}
	
	h /= 60; 
	i = Math.floor(h);
	f = h - i; 
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch(i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
			
		case 1:
			r = q;
			g = v;
			b = p;
			break;
			
		case 2:
			r = p;
			g = v;
			b = t;
			break;
			
		case 3:
			r = p;
			g = q;
			b = v;
			break;
			
		case 4:
			r = t;
			g = p;
			b = v;
			break;
			
		default: // case 5:
			r = v;
			g = p;
			b = q;
	}
	
	return { red : Math.round(r * 255), green: Math.round(g * 255), blue: Math.round(b * 255)};
}


io.sockets.on("connection", function(socket){
	
	board.on('generate', function(){
		socket.emit('generate');
	});
	board.on('stop', function(){
		socket.emit('stop');
	});
	board.on('mode', function(){
		socket.emit('mode');
	});

	board.on('change', function(data){
		socket.emit('change', { color : data });
	});


});