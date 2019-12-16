const { mat4 } = glMatrix

function mod (a, b) {
  return (a % b + b) % b
}

class Vector2 {
  constructor (x = 0, y = 0) {
    this.set({ x, y })
  }

  get length () {
    return Math.hypot(this.x, this.y)
  }

  get comps () {
    return [this.x, this.y]
  }

  set ({ x = 0, y = 0 }) {
    this.x = x
    this.y = y
    return this
  }

  add ({ x = 0, y = 0 }) {
    this.x += x
    this.y += y
    return this
  }

  scale (factor = 1) {
    this.x *= factor
    this.y *= factor
    return this
  }

  unit () {
    return this.scale(1 / this.length)
  }

  rotate (angle = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const { x, y } = this
    this.x = x * cos - y * sin
    this.y = x * sin + y * cos
    return this
  }

  clone () {
    return new Vector2(this.x, this.y)
  }
}

class Vector3 {
  constructor (x = 0, y = 0, z = 0) {
    this.set({ x, y, z })
  }

  get length () {
    if (this._length === undefined) {
      this._length = Math.hypot(this.x, this.y, this.z)
    }
    return this._length
  }

  get comps () {
    return [this.x, this.y, this.z]
  }

  set ({ x = 0, y = 0, z = 0 }) {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  add ({ x = 0, y = 0, z = 0 }) {
    this.x += x
    this.y += y
    this.z += z
    return this
  }

  scale (factor = 1) {
    this.x *= factor
    this.y *= factor
    this.z *= factor
    return this
  }

  unit () {
    return this.scale(1 / this.length)
  }

  rotateAboutGlobalX (angle = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const { z, y } = this
    this.z = -(z * cos - y * sin)
    this.y = z * sin + y * cos
    return this
  }

  rotateAboutGlobalY (angle = 0) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const { x, z } = this
    this.x = -(x * cos - z * sin)
    this.z = -(x * sin + z * cos)
    return this
  }

  clone () {
    return new Vector3(this.x, this.y, this.z)
  }
}

const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')

let width, height, projectionMatrix
function resize() {
  // TODO: device pixel ratio
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width
  canvas.height = height
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  projectionMatrix = mat4.create()
  mat4.perspective(projectionMatrix, 90 * Math.PI / 180, width / height, 0.1, 100)
}
window.addEventListener('resize', resize)
resize()

function createTexture (canvas) {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
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
function shaderProgram ({
  vsSource = `
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
  fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main() {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `,
  attrs = [
    ['vertexPosition', 'aVertexPosition'],
    ['textureCoord', 'aTextureCoord']
  ],
  uniforms = [
    ['projectionMatrix', 'uProjectionMatrix'],
    ['modelViewMatrix', 'uModelViewMatrix'],
    ['uSampler', 'uSampler']
  ]
} = {}) {
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

function makeBuffers (faces, textureCoords) {
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faces), gl.STATIC_DRAW)

  let textureCoordBuffer
  if (textureCoords) {
    textureCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)
  }

  const indexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  const indices = []
  const indexSets = faces.length / 12
  for (let i = 0; i < indexSets; i++) {
    indices.push(i * 4, i * 4 + 1, i * 4 + 2)
    indices.push(i * 4, i * 4 + 3, i * 4 + 2)
  }
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
    vertexCount: indices.length
  }
}

function drawScene (programInfo, buffers, texture, modelViewMatrix, clear = true) {
  if (clear) {
    gl.clearColor(54 / 255, 0 / 255, 33 / 255, 1)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  gl.useProgram(programInfo.program)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
  gl.vertexAttribPointer( programInfo.attrs.vertexPosition, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(programInfo.attrs.vertexPosition)

  if (texture) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord)
    gl.vertexAttribPointer(programInfo.attrs.textureCoord, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(programInfo.attrs.textureCoord)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(programInfo.uniforms.uSampler, 0)
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)

  gl.uniformMatrix4fv(programInfo.uniforms.projectionMatrix, false, projectionMatrix)
  gl.uniformMatrix4fv(programInfo.uniforms.modelViewMatrix, false, modelViewMatrix)

  gl.drawElements(gl.TRIANGLES, buffers.vertexCount, gl.UNSIGNED_SHORT, 0)
}
