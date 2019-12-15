const { mat4 } = glMatrix
const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')
let width, height
function resize() {
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}
window.addEventListener('resize', resize)
resize()

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

const shaderProgram = initShaderProgram(
  gl,
  `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `,
  `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main() {
      // Fetches "texel" (texture pixel) from texture; interpolates between
      // given texture coordinates like colours do
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `
)
const programInfo = {
  program: shaderProgram,
  attrLocs: {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
  },
  uniformLocs: {
    projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
  }
}
const shaderProgramColour = initShaderProgram(
  gl,
  `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColour;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColour;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColour = aVertexColour;
    }
  `,
  `
    varying lowp vec4 vColour;

    void main() {
      gl_FragColor = vColour;
    }
  `
)
const programInfoColour = {
  program: shaderProgramColour,
  attrLocs: {
    vertexPosition: gl.getAttribLocation(shaderProgramColour, 'aVertexPosition'),
    vertexColour: gl.getAttribLocation(shaderProgramColour, 'aVertexColour')
  },
  uniformLocs: {
    projectionMatrix: gl.getUniformLocation(shaderProgramColour, 'uProjectionMatrix'),
    modelViewMatrix: gl.getUniformLocation(shaderProgramColour, 'uModelViewMatrix')
  }
}

function isPowerOf2 (n) {
  return (n & (n - 1)) === 0
}

// When image loads, it'll be copied onto a texture
function loadTexture (gl, url) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)

  // Temporarily make the texture a single pixel until the image loads
  const level = 0
  const internalFormat = gl.RGBA
  const srcFormat = gl.RGBA
  const srcType = gl.UNSIGNED_BYTE
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    1, // width
    1, // height
    0, // border
    srcFormat,
    srcType,
    new Uint8Array([255, 193, 7, 255]) // pixel
  )

  const image = new Image()
  image.onload = e => {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)

    // WebGL treats power of 2 images vs not-sos differently
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // mip
      // mip
      gl.generateMipmap(gl.TEXTURE_2D)
      // The following two are needed to prevent white lines in between textures
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      // The following two are needed to make the texture not blurry
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    } else {
      // Turn off mips, set wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      // MDN offers some other option but I don't think I'll be using non-power-of-2
      // images, but just in case:
      // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
    }
  }
  image.src = url

  return texture
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

  const position2Buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, position2Buffer)
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

  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  // Coordinates correspond to each vertex, but only range between 0 and 1
  const textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW)

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
    position2: position2Buffer,
    colour: colourBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer
  }
}
const buffers = initBuffers(gl)
const texture = loadTexture(gl, './test-cube.png')

let squareRotation = 0
function drawScene (gl, programInfo, buffers, texture, elapsedTime) {
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

  // ----- TEXTURE KAABA -----

  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.5, 0.0, -6.0])
  mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation, [0, 1, 1])

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

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord)
  gl.vertexAttribPointer(
    programInfo.attrLocs.textureCoord,
    2,
    gl.FLOAT,
    false,
    0,
    0
  )
  gl.enableVertexAttribArray(programInfo.attrLocs.textureCoord)

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

  // We are affecting "texture unit 0"
  gl.activeTexture(gl.TEXTURE0)
  // Bind texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // Tell the shader we bound to 0 so that it'll use texture unit 0
  gl.uniform1i(programInfo.uniformLocs.uSampler, 0)

  const vertexCount = 36
  const type = gl.UNSIGNED_SHORT
  const offset = 0
  gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)

  // ----- COLOUR KAABA -----
  {
    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.5, 0.0, -6.0])
    mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation, [0, 1, 1])
    mat4.rotate(modelViewMatrix, modelViewMatrix, squareRotation * 0.7, [0, 1, 0])

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position2)
    gl.vertexAttribPointer(
      programInfoColour.attrLocs.vertexPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0
    )
    gl.enableVertexAttribArray(programInfoColour.attrLocs.vertexPosition)

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colour)
    gl.vertexAttribPointer(
      programInfoColour.attrLocs.vertexColour,
      4,
      gl.FLOAT,
      false,
      0,
      0
    )
    gl.enableVertexAttribArray(programInfoColour.attrLocs.vertexColour)

    // Tell which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

    gl.useProgram(programInfoColour.program)

    // Tell which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

    gl.uniformMatrix4fv(
      programInfoColour.uniformLocs.projectionMatrix,
      false,
      projectionMatrix
    )
    gl.uniformMatrix4fv(
      programInfoColour.uniformLocs.modelViewMatrix,
      false,
      modelViewMatrix
    )

    const vertexCount = 36
    const type = gl.UNSIGNED_SHORT
    const offset = 0
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset)
  }
}

let lastTime = Date.now()
function render () {
  const now = Date.now()
  const elapsedTime = now - lastTime
  lastTime = now

  drawScene(gl, programInfo, buffers, texture, elapsedTime / 1000)

  requestAnimationFrame(render)
}

render()
