/*La 
aplicación (script en webgl y shaders) debe dibujar una polilínea y sus vértices conforme el usuario va 
punteando la pantalla. La intensidad del color de los vértices y tramos de la polilínea deberá ser 
proporcional a su cercanía al centro del área de dibujo. Elegir a voluntad el color de fondo del canvas
así como el de la polilínea*/


// Shader de vertices
const VSHADER_SOURCE = `
    attribute vec3 posicion;
    void main(){
        gl_Position = vec4(posicion,1.0);
        gl_PointSize = 10.0;
    }
`

// Shader de fragmentos
const FSHADER_SOURCE = `
    uniform highp vec3 color;
    void main(){
        gl_FragColor = vec4(color,1.0);
    }
`
const clicks = [];
const coloresClicks = [];
let bufferVertices = null;
let bufferColores = null;
function main()
{
    // Recupera el lienzo
    const canvas = document.getElementById("canvas");
    const gl = getWebGLContext( canvas );

    // Cargo shaders en programa de GPU
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("No se han cargado los shaders");
    }

    // Color de borrado del lienzo (fondo color azul oscuro)
    gl.clearColor(0.0, 0.0, 0.3, 1.0);

    // Localiza el att del shader posicion
    const coordenadas = gl.getAttribLocation( gl.program, 'posicion');

    // Crea buffer, lo activas y lo enlaza
    bufferVertices = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferVertices );
    gl.vertexAttribPointer( coordenadas, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( coordenadas );

    
    const colores = gl.getAttribLocation( gl.program, 'color' );

    // Registrar la call-back del click del raton
    canvas.onmousedown = function(evento){ click(evento,gl,canvas); };
    bufferColores = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferColores );
	gl.vertexAttribPointer( colores, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( colores );
    // Dibujar
    render( gl );
    
}
function click( evento, gl, canvas )
{

    let x = evento.clientX;
    let y = evento.clientY;
    const rect = evento.target.getBoundingClientRect();

    // Conversion de coordenadas
    x = ((x-rect.left)-canvas.width/2) * 2/canvas.width;
    y = ( canvas.height/2 - (y-rect.top)) * 2/canvas.height;

	
	// Guardar las coordenadas y copia el array
	clicks.push(x); clicks.push(y); clicks.push(0.0);

    //Cada click tendra un color segun su distancia al centro
    var distancia = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    //Para cada click necesito las 3 componentes mas el alpha (1.0)
    for( var i = 0; i < 3; i++ ) {
        coloresClicks.push(distancia);
    }
	// Alfa. Color de 4 componentes
	coloresClicks.push(1.0);
	
	// Redibujar con cada click
	render( gl );
}

function render( gl )
{
	// Borra el canvas con el color de fondo
	gl.clear( gl.COLOR_BUFFER_BIT );

	const puntos = new Float32Array(clicks); // array de puntos
	const colores = new Float32Array(coloresClicks); // array de colores
	// Borra el canvas con el color de fondo
	gl.clear( gl.COLOR_BUFFER_BIT );
	// Rellena los BOs con las coordenadas y colores y lo manda a proceso
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferVertices );
	gl.bufferData( gl.ARRAY_BUFFER, puntos, gl.STATIC_DRAW );
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferColores );
	gl.bufferData( gl.ARRAY_BUFFER, colores, gl.STATIC_DRAW );
	gl.drawArrays( gl.POINTS, 0, puntos.length/3 )	
	gl.drawArrays( gl.LINE_STRIP, 0, puntos.length/3 )	
}