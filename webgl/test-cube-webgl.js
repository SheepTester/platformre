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
    -1.0,  1.0,
     1.0,  1.0,
    -1.0, -1.0,
     1.0, -1.0,
  ]
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW
  )

  const colours = [
    81, 91, 212, 255, // blue
    129, 52, 175, 255, // purple
    254, 218, 119, 255, // yellow
    221, 42, 123, 255 // magenta
  ].map(c => c / 255)

  const colourBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    colour: colourBuffer
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

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer(
    programInfo.attrLocs.vertexPosition,
    2,
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

  const offset = 0
  const vertexCount = 4
  gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
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
