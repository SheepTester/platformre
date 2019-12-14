const { mat4 } = glMatrix

const canvas = document.getElementById('canvas')

let width, height
function resize () {
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
}
resize()

// Needs to be declared *after* resizing the canvas, or maybe you have to
// let WebGL know its size changed idk
const gl = canvas.getContext('webgl')

// Vertex shader converts our vertices into WebGl coordinates, very
// scary
// Figuring out what part of a texture or the lighting value can be done here
const vertexShaderCode = `
  // Our vertex position
  // "attribute" will receive values from its assigned buffer
  attribute vec4 aVertexPosition;

  // idk lol
  // "uniform" is like a global variable; it stays the same throughout
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  void main() {
    // Save it in this variable to return the transformed vertex uau uau
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`
// Fragment shader determine colours for a pixel
// Applying a texture or lighting is done here
const fragmentShaderCode = `
  void main() {
    // Some opaque colour? (uncomment later pls)
    gl_FragColor = vec4(224.0 / 255.0, 165.0 / 255.0, 233.0 / 255.0, 1.0);
  }
`

// Creates shader with source and compiles it!
function loadShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source) // Give it the code
  gl.compileShader(shader)
  // See if it was problematic
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('shader compile wucky', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// Make shader program uau uau
function initShaderProgram (gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.warn('shader program wucky', gl.getProgramInfoLog(shaderProgram))
    // Research later: is the program supposed to be deleted?
    // meh whatever this isn't supposed to be reachable anyways
    return null
  }

  return shaderProgram
}

const shaderProgram = initShaderProgram(gl, vertexShaderCode, fragmentShaderCode)

const programInfo = {
  program: shaderProgram,
  attrLocs: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
  },
  uniformLocs: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
  },
}

// Create a buffer of vertex positions
function initBuffers (gl) {
  // Buffer for square's positions
  const positionBuffer = gl.createBuffer()
  // Tell WebGL the following operations shall be done on this buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  // Array of positions for square
  const positions = [
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
  ]
  // Give array to WebGL by filling current buffer with it
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW
  )
  return {
    position: positionBuffer,
  }
}

const buffers = initBuffers(gl)

// Set the clear colour to some opaque colour
gl.clearColor(86 / 255, 122 / 255, 177 / 255, 1)
// Clear everything
gl.clearDepth(1.0)
// Enable "depth testing" which means...
gl.enable(gl.DEPTH_TEST)
// ...closer things cover up things further away
gl.depthFunc(gl.LEQUAL)
// Clear canvas
gl.clear(gl.COLOR_BUFFER_BIT)

// Perspective matrix simulates camera perspective distortion, scary!
const fov = 45 * Math.PI / 180
const aspect = width / height
const zNear = 0.1
const zFar = 100.0
const projectionMatrix = mat4.create()
// In glmatrix.js, first argument is the target matrix
mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar)

// Start from an "identity" point (centre of the scene)
const modelViewMatrix = mat4.create()
// Move to where square should be drawn
// (the array is amount to translate: 6 units out from the camera)
mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0])

// Tell WebGL how to pull out the positions from the position buffer for the
// square into the `aVertexPosition` shader attribute
gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
gl.vertexAttribPointer(
  programInfo.attrLocs.vertexPosition,
  2, // "numComponents" - Pull out two values per iteration
  gl.FLOAT, // "type" - Buffer data type is 32bit float
  false, // "normalize" - Normalizen't?
  0, // "stride" - Number of bytes to get to next value; 0 means to determine from numComponents and type
  0 // "offset" - Buffer start position
)
gl.enableVertexAttribArray(programInfo.attrLocs.vertexPosition)

// Notice my program, WebGL-senpai!
gl.useProgram(programInfo.program)

// Set the shader uniform values
gl.uniformMatrix4fv(
  programInfo.uniformLocs.projectionMatrix,
  false,
  projectionMatrix
)
gl.uniformMatrix4fv(
  programInfo.uniformLocs.modelViewMatrix,
  false,
  modelViewMatrix
)

const offset = 0
const vertexCount = 4
gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
