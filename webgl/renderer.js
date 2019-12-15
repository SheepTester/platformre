const { mat4 } = glMatrix

function mod (a, b) {
  return (a % b + b) % b
}

const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')

let width, height
function resize() {
  // TODO: device pixel ratio
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}
window.addEventListener('resize', resize)
resize()

function createTexture (canvas) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  return texture
}

function loadShader (gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error('shader compile wucky' + log)
  }
  return shader
}
function shaderProgram (gl, vsSource, fsSource, attrs, uniforms) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error('shader program wucky' + gl.getProgramInfoLog(shaderProgram))
  }

  const attrLocs = {}
  for (const [prop, attr] of attrs) {
    attrLocs[prop] = gl.getAttribLocation(shaderProgram, attr)
  }
  const uniformLocs = {}
  for (const [prop, uniform] of uniforms) {
    uniformLocs[prop] = gl.getUniformLocation(shaderProgram, uniform)
  }
  return {
    program: shaderProgram,
    attrs: attrLocs,
    uniforms: uniformLocs
  }
}
function makeProgram () {
  return shaderProgram(
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
    `,
    [
      ['vertexPosition', 'aVertexPosition'],
      ['textureCoord', 'aTextureCoord']
    ],
    [
      ['projectionMatrix', 'uProjectionMatrix'],
      ['modelViewMatrix', 'uModelViewMatrix'],
      ['uSampler', 'uSampler']
    ]
  )
}

function makeBuffers (faces, textureCoords) {
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faces), gl.STATIC_DRAW)

  const textureCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  const indices = []
  const indexSets = faces.length / 12
  for (let i = 0; i < indexSets; i++) {
    indices.push(i * 6, i * 6 + 1, i * 6 + 2)
    indices.push(i * 6, i * 6 + 3, i * 6 + 2)
  }
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
    vertexCount: indices.length
  }
}

function drawScene (programInfo, buffers, texture) {
  gl.clearColor(54 / 255, 0 / 255, 33 / 255, 1)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, 45 * Math.PI / 180, width / height, 0.1, 100)

  const cameraMatrix = mat4.create()
  mat4.translate(cameraMatrix, cameraMatrix, [0, 0.0, -6.0])

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer( programInfo.attrs.vertexPosition, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(programInfo.attrs.vertexPosition)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord)
  gl.vertexAttribPointer(programInfo.attrs.textureCoord, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(programInfo.attrs.textureCoord)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

  gl.useProgram(programInfo.program)

  gl.uniformMatrix4fv(programInfo.uniforms.projectionMatrix, false, projectionMatrix)
  gl.uniformMatrix4fv(programInfo.uniforms.modelViewMatrix, false, cameraMatrix)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.uniform1i(programInfo.uniforms.uSampler, 0)

  gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0)
}