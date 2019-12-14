const { mat4 } = glMatrix
const canvas = document.getElementById('canvas')
const width = window.innerWidth
const height = window.innerHeight
canvas.width = width
canvas.height = height
const gl = canvas.getContext('webgl')

const vertexShaderCode = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColour;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColour;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColour = aVertexColour;
  }
`
const fragmentShaderCode = `
  varying lowp vec4 vColour;

  void main() {
    gl_FragColor = vColour;
  }
`
function loadShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('shader compile wucky', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}
function initShaderProgram (gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.warn('shader program wucky', gl.getProgramInfoLog(shaderProgram))
    return null
  }

  return shaderProgram
}

const shaderProgram = initShaderProgram(gl, vertexShaderCode, fragmentShaderCode)
const programInfo = {
  program: shaderProgram,
  attrLocs: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    vertexColour: gl.getAttribLocation(shaderProgram, 'aVertexColour')
  },
  uniformLocs: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
  }
}

function initBuffers (gl) {
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ]
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW
  )

  const faceColours = [
    [233, 30, 99], // pink
    [156, 39, 176], // purple
    [63, 81, 181], // indigo
    [33, 150, 243], // blue
    [0, 188, 212], // cyan
    [0, 150, 136] // teal
  ].map(c => [...c.map(ch => ch / 255), 1])
  // Convert array of colours into table for each vertex
  const colours = []
  for (const colour of faceColours) {
    // Four times for each vertex of face
    colours.push(...colour, ...colour, ...colour, ...colour)
  }

  const colourBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  // Following array defines each face as two triangles referencing indices of
  // vertex array to specify triangles' positions (an "element array")
  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ]
  // Give array to WebGL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    colour: colourBuffer,
    indices: indexBuffer
  }
}
const buffers = initBuffers(gl)

let squareRotation = 0
function drawScene (gl, programInfo, buffers, elapsedTime) {
  squareRotation += elapsedTime

  gl.clearColor(54 / 255, 0 / 255, 33 / 255, 1)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const fov = 45 * Math.PI / 180
  const aspect = width / height
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar)

  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0])
  mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation, [0, 1, 1])
  // mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation * 0.7, [0, 1, 0])

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(
    programInfo.attrLocs.vertexPosition,
    3,
    gl.FLOAT,
    false,
    0,
    0
  )
  gl.enableVertexAttribArray(programInfo.attrLocs.vertexPosition)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colour)
  gl.vertexAttribPointer(
    programInfo.attrLocs.vertexColour,
    4,
    gl.FLOAT,
    false,
    0,
    0
  )
  gl.enableVertexAttribArray(programInfo.attrLocs.vertexColour)

  // Tell which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

  gl.useProgram(programInfo.program)

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

  const vertexCount = 36
  const type = gl.UNSIGNED_SHORT
  const offset = 0
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
}

let lastTime = Date.now()
function render () {
  const now = Date.now()
  const elapsedTime = now - lastTime
  lastTime = now

  drawScene(gl, programInfo, buffers, elapsedTime / 1000)

  requestAnimationFrame(render)
}

render()
