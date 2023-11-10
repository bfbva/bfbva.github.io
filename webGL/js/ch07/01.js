"use strict";

const{vec2, vec3, vec4 } = glMatrix;

var canvas;
var gl;
var program;

var texSize = 4;
//用于存储纹理图像的像素数据
var image1 = new Array()
	for( var i=0; i<texSize; i++ ) 
		image1[i] = new Array();
	for( var i=0; i<texSize; i++ )
		for( var j=0; j<texSize; j++ )
			image1[i][j] = new Float32Array(4);
	for( var i=0; i<texSize; i++ )
		for( var j=0; j<texSize; j++ ){
			var c = ((( i & 0x2 ) == 0 ) ^ (( j & 0x2 ) == 0 ));
			image1[i][j] = [ c, c, c, 1 ];
		}
//image2数组中存储了纹理图像的像素数据，每个像素占据4个字节，依次存储红、绿、蓝和alpha通道的值。
var image2 = new Uint8Array( 4 * texSize * texSize )
for( var i = 0; i < texSize; i++ )
	for( var j = 0; j < texSize; j++ )
		for( var k = 0; k < 4; k++ )
			image2[ 4 * texSize * i + 4 * j + k ] = 255 * image1[i][j][k];	

var points = [];
var colors = [];
var texCoords = [];

var texture;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var theta = [ 0.0, 0.0, 0.0 ];
var thetaLoc;
//创建顶点数据
function makeCube(){
	var radius = 0.5;
	var latitudeBands = 30;
	var longitudeBands = 30;
	
    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
    	var theta = latNumber * Math.PI / latitudeBands;
    	var sinTheta = Math.sin(theta);
    	var cosTheta = Math.cos(theta);
    
    	for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
    		var phi = longNumber * 2 * Math.PI / longitudeBands;
    		var sinPhi = Math.sin(phi);
    		var cosPhi = Math.cos(phi);
    
    		var x = cosPhi * sinTheta;
    		var y = cosTheta;
    		var z = sinPhi * sinTheta;
    		var u = 1 - (longNumber / longitudeBands);
    		var v = 1 - (latNumber / latitudeBands);
    
    		normalData.push(x);
    		normalData.push(y);
    		normalData.push(z);
    		textureCoordData.push(u);
    		textureCoordData.push(v);
    		vertexPositionData.push(radius * x);
    		vertexPositionData.push(radius * y);
    		vertexPositionData.push(radius * z);
    		vertexPositionData.push(1.0);
    	}
    }
    
    var indexData = [];
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
    	for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
    		var first = (latNumber * (longitudeBands + 1)) + longNumber;
    		var second = first + longitudeBands + 1;
    		indexData.push(first);
    		indexData.push(second);
    		indexData.push(first + 1);
    
    		indexData.push(second);
    		indexData.push(second + 1);
    		indexData.push(first + 1);
    	}
    }
    
    for (var i = 0; i < indexData.length; i+=3) {
    	points.push(vertexPositionData[indexData[i] * 4], vertexPositionData[indexData[i] * 4 + 1], vertexPositionData[indexData[i] * 4 + 2], vertexPositionData[indexData[i] * 4 + 3]);
    	points.push(vertexPositionData[indexData[i+1] * 4], vertexPositionData[indexData[i+1] * 4 + 1], vertexPositionData[indexData[i+1] * 4 + 2], vertexPositionData[indexData[i+1] * 4 + 3]);
    	points.push(vertexPositionData[indexData[i+2] * 4], vertexPositionData[indexData[i+2] * 4 + 1], vertexPositionData[indexData[i+2] * 4 + 2], vertexPositionData[indexData[i+2] * 4 + 3]);
    
    	colors.push(1.0, 1.0, 1.0, 1.0);
    	colors.push(1.0, 1.0, 1.0, 1.0);
    	colors.push(1.0, 1.0, 1.0, 1.0);
    
    	texCoords.push(textureCoordData[indexData[i] * 2], textureCoordData[indexData[i] * 2 + 1]);
    	texCoords.push(textureCoordData[indexData[i+1] * 2], textureCoordData[indexData[i+1] * 2 + 1]);
    	texCoords.push(textureCoordData[indexData[i+2] * 2], textureCoordData[indexData[i+2] * 2 + 1]);
    }

}



function configureTexture( image ){
	texture = gl.createTexture();
	
	gl.activeTexture( gl.TEXTURE0 );
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image );	
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

window.onload = function initCube(){
	canvas = document.getElementById( "gl-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.8, 0.3, 0.0, 0.4 );

	gl.enable( gl.DEPTH_TEST );

	// Load shaders and initialize attribute buffers
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	makeCube();

	var cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colors ), gl.STATIC_DRAW );

	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );

	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( points ), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	var tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );

	var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
	gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vTexCoord );

	configureTexture( image2 );

	thetaLoc = gl.getUniformLocation( program, "theta" );
	document.getElementById( "ButtonX" ).onclick = function(){
		axis = xAxis;
	}

	document.getElementById( "ButtonY" ).onclick = function(){
		axis = yAxis;
	}

	document.getElementById( "ButtonZ" ).onclick = function(){
		axis = zAxis;
	}

	render();
}

function render(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	theta[ axis ] += 2.0;
	gl.uniform3fv( thetaLoc, theta );

	gl.drawArrays( gl.TRIANGLES, 0, points.length/4 );

	requestAnimFrame( render );
}
