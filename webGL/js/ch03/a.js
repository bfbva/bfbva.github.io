"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var direction = 1;
var speed;

var min = 1;
var max = 100;
function jian() {
    var inp = parseInt(document.getElementById('inp').value);
    if (inp <= min) {
     alert('输入值至少为' + min)
    } else {
        inp -= 1;
        if (inp <= 1) {
			document.getElementById('inp').value = min
        } else {
            document.getElementById('inp').value = inp;
        }
    }
	
}
function jia() {
    var inp = parseInt(document.getElementById('inp').value);
    if (inp > max) {
        alert('输入最大值为' + max);
    } else {
        inp += 1;
        document.getElementById('inp').value = inp;
    }
	
}


function changeDir(){
	direction *= -1;
}

function initRotSquare(){
	canvas = document.getElementById( "rot-canvas" );
	gl = WebGLUtils.setupWebGL( canvas, "experimental-webgl" );
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	var program = initShaders( gl, "rot-v-shader", "rot-f-shader" );
	gl.useProgram( program );

	var vertices = [
		 0,  1,  0,
		-1,  0,  0,
		 1,  0,  0,
		 0, -1,  0
	];

	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	thetaLoc = gl.getUniformLocation( program, "theta" );
	
    speed =  document.getElementById('inp').value;

	renderSquare();
}

function renderSquare(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	// set uniform values
	theta += direction * 0.1;
	
	gl.uniform1f( thetaLoc, theta );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
    speed =  100-document.getElementById('inp').value;
	// update and render
	setTimeout( function(){ window.requestAnimFrame( renderSquare ); }, speed );
}
