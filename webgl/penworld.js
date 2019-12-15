const blocks = {
  air: {},
  grass: {
    texture: {
      top: './textures/grass-top.png',
      left: './textures/grass-side.png',
      right: './textures/grass-side.png',
      front: './textures/grass-side.png',
      back: './textures/grass-side.png',
      bottom: './textures/dirt.png'
    },
    solid: true
  },
  dirt: {
    texture: './textures/dirt.png',
    solid: true
  },
  stone: {
    texture: './textures/stone.png',
    solid: true
  }
}
const textures = {}
let textureURLs = []
for (const { texture } of Object.values(blocks)) {
  if (texture) {
    if (typeof texture === 'string') {
      if (!textureURLs.includes(texture)) {
        textureURLs.push(texture)
      }
    } else {
      for (const url of Object.values(texture)) {
        if (!textureURLs.includes(url)) {
          textureURLs.push(url)
        }
      }
    }
  }
}
const textureSize = 16 // oh well lol
const textureAtlasPromise = Promise.all(textureURLs.map(url =>
  new Promise(resolve => {
    const image = new Image()
    image.onload = e => {
      resolve({ url, image })
    }
    image.src = url
  })))
  .then(images => {
    const canvas = document.createElement('canvas')
    const c = canvas.getContext('2d')
    const columns = 2 ** Math.ceil(Math.log2(Math.sqrt(images.length)))
    const rows = 2 ** Math.ceil(Math.log2(images.length / columns))
    canvas.width = columns * textureSize
    canvas.height = rows * textureSize
    for (let i = 0; i < images.length; i++) {
      const { url, image } = images[i]
      const col = i % columns
      const row = i / columns | 0
      textures[url] = {
        image,
        coords: [
          col / columns, row / rows,
          (col + 1) / columns, row / rows,
          (col + 1) / columns, (row + 1) / rows,
          col / columns, (row + 1) / rows,
        ]
      }
      c.drawImage(image, col * textureSize, row * textureSize)
    }
    return canvas
  })

const neighbours = [
  [0, 1, 0, 'top', 'bottom'],
  [0, -1, 0, 'bottom', 'top'],
  [1, 0, 0, 'right', 'left'],
  [-1, 0, 0, 'left', 'right'],
  [0, 0, 1, 'front', 'back'],
  [0, 0, -1, 'back', 'front']
]

let facesChanged = false

class Block {
  constructor (type) {
    this.type = type
    this.faces = {}
  }

  characteristics () {
    return blocks[this.type] || {}
  }

  texture (face) {
    const { texture } = this.characteristics()
    return texture ? texture[face] || texture : null
  }

  isSolid () {
    return this.characteristics().solid
  }

  showFace (face) {
    if (this.faces[face]) return
    const texture = this.texture(face)
    if (texture) {
      const { x, y, z } = this
      const globalX = this.chunk.x * CHUNK_SIZE + x
      const globalY = this.chunk.y * CHUNK_SIZE + y
      const globalZ = this.chunk.z * CHUNK_SIZE + z
      let plane
      if (face === 'top' || face === 'bottom') {
        const planeY = face === 'top' ? globalY + 1 : globalY
        plane = [
          globalX + 1, planeY, globalZ + 1,
          globalX, planeY, globalZ + 1,
          globalX, planeY, globalZ,
          globalX + 1, planeY, globalZ
        ]
      } else if (face === 'left' || face === 'right') {
        const planeX = face === 'right' ? globalX + 1 : globalX
        plane = [
          planeX, globalY + 1, globalZ + 1,
          planeX, globalY + 1, globalZ,
          planeX, globalY, globalZ,
          planeX, globalY, globalZ + 1
        ]
      } else if (face === 'front' || face === 'back') {
        const planeZ = face === 'front' ? globalZ + 1 : globalZ
        plane = [
          globalX + 1, globalY + 1, planeZ,
          globalX, globalY + 1, planeZ,
          globalX, globalY, planeZ,
          globalX + 1, globalY, planeZ
        ]
      } else {
        return
      }
      this.faces[face] = {
        plane,
        coords: textures[texture].coords
      }
      if (!facesChanged) facesChanged = true
    }
  }

  hideFace (face) {
    if (this.faces[face]) {
      delete this.faces[face]
      if (!facesChanged) facesChanged = true
    }
  }

  neighbourIsSolid (offsetX = 0, offsetY = 0, offsetZ = 0) {
    const { x, y, z } = this
    const neighbour = this.chunk.getBlock(x + offsetX, y + offsetY, z + offsetZ)
    return neighbour ? neighbour.isSolid() : false
  }

  updateFaces () {
    const amSolid = this.isSolid()
    const { x, y, z } = this
    for (const [offsetX, offsetY, offsetZ, myFace, theirFace] of neighbours) {
      const neighbour = this.chunk.getBlock(x + offsetX, y + offsetY, z + offsetZ)
      const theyreSolid = neighbour && neighbour.isSolid()
      if (amSolid && theyreSolid) {
        this.hideFace(myFace)
        neighbour.hideFace(theirFace)
      } else {
        this.showFace(myFace)
        if (neighbour) {
          neighbour.showFace(theirFace)
        }
      }
    }
  }
}

const CHUNK_SIZE = 16

class Subchunk {
  constructor (x, y, z) {
    if (Subchunk.subchunks[`${x},${y},${z}`]) {
      throw new Error('Chunk exists where I am!')
    }
    Subchunk.subchunks[`${x},${y},${z}`] = this

    this.x = x
    this.y = y
    this.z = z
    this.blocks = new Array(CHUNK_SIZE ** 3).fill(null)
  }

  getChunk (offsetX = 0, offsetY = 0, offsetZ = 0) {
    const { x, y, z } = this
    return subchunks[`${x + offsetX},${y + offsetY},${z + offsetZ}`]
  }

  inChunk (x, y, z) {
    return x >= 0 && x < CHUNK_SIZE && y >= 0 && y < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE
  }

  getBlock (x, y, z) {
    if (this.inChunk(x, y, z)) {
      return this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z]
    } else {
      return Subchunk.getGlobalBlock(
        this.x * CHUNK_SIZE + x,
        this.y * CHUNK_SIZE + y,
        this.z * CHUNK_SIZE + z
      )
    }
  }

  setBlock (x, y, z, block) {
    if (!this.inChunk(x, y, z)) {
      throw new Error('not my block!')
    }
    if (this.getBlock(x, y, z)) {
      this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z].chunk = null
    }
    this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z] = block
    if (block) {
      block.chunk = this
      block.x = x
      block.y = y
      block.z = z
      block.updateFaces()
    }
  }

  storeFacesIn (faces, textureCoords) {
    for (const block of this.blocks) {
      if (block) {
        for (const { plane, coords } of Object.values(block.faces)) {
          faces.push(...plane)
          textureCoords.push(...coords)
        }
      }
    }
  }

  static getGlobalBlock (x, y, z) {
    const subchunk = this.subchunks[`${Math.floor(x / CHUNK_SIZE)},${Math.floor(y / CHUNK_SIZE)},${Math.floor(z / CHUNK_SIZE | 0)}`]
    if (subchunk) {
      return subchunk.getBlock(mod(x, CHUNK_SIZE), mod(y, CHUNK_SIZE), mod(z, CHUNK_SIZE))
    } else {
      return null
    }
  }
}

Subchunk.subchunks = {}

const program = makeProgram()
let buffers
let textureAtlas

const subchunk = new Subchunk(0, 0, 0)

textureAtlasPromise.then(createTexture)
  .then(texture => {
    textureAtlas = texture

    // TEMP "world gen"
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          subchunk.setBlock(x, y, z, new Block(y < 4 ? 'stone' : y < 7 ? 'dirt' : 'grass'))
        }
      }
    }

    render()
  })

const position = { x: 5, y: 10, z: 5 }
const rotation = { vertical: 0, lateral: 0 }

let mouseLocked = false
document.addEventListener('pointerlockchange', e => {
  mouseLocked = document.pointerLockElement === canvas
})
canvas.addEventListener('click', e => {
  canvas.requestPointerLock()
})
canvas.addEventListener('mousemove', e => {
  if (mouseLocked) {
    rotation.lateral += e.movementX / 500
    rotation.vertical += e.movementY / 500
    if (rotation.vertical > Math.PI / 2) rotation.vertical = Math.PI / 2
    else if (rotation.vertical < -Math.PI / 2) rotation.vertical = -Math.PI / 2
  }
})

const keys = {}
document.addEventListener('keydown', e => {
  if (mouseLocked) {
    keys[e.key.toLowerCase()] = true
  }
})
document.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false
})

let speed = 5
document.addEventListener('wheel', e => {
  if (mouseLocked) {
    speed -= e.deltaY / 100
    if (speed < 0) speed = 0
  }
})

let lastTime = Date.now()
function render () {
  const now = Date.now()
  const elapsedTime = (now - lastTime) / 1000
  lastTime = now

  if (elapsedTime < 0.1) {
    if (keys.shift) {
      position.y -= elapsedTime * speed
    }
    if (keys[' ']) {
      position.y += elapsedTime * speed
    }
    const movement = new Vector2()
    if (keys.a) movement.add({x: -1})
    if (keys.d) movement.add({x: 1})
    if (keys.w) movement.add({y: -1})
    if (keys.s) movement.add({y: 1})
    if (movement.length) {
      const { x, y } = movement.unit().scale(elapsedTime * speed).rotate(rotation.lateral)
      position.x += x
      position.z += y
    }
  }

  if (facesChanged || !buffers) {
    const faces = []
    const textureCoords = []
    // TEMP; should do all subchunks nearby
    subchunk.storeFacesIn(faces, textureCoords)
    buffers = makeBuffers(faces, textureCoords)
    facesChanged = false
  }

  const cameraMatrix = mat4.create()
  mat4.translate(cameraMatrix, cameraMatrix, [position.x, position.y, position.z])
  mat4.rotate(cameraMatrix, cameraMatrix, -rotation.lateral, [0, 1, 0])
  mat4.rotate(cameraMatrix, cameraMatrix, -rotation.vertical, [1, 0, 0])
  mat4.invert(cameraMatrix, cameraMatrix)
  drawScene(program, buffers, textureAtlas, cameraMatrix)

  window.requestAnimationFrame(render)
}
