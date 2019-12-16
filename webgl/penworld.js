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
    solid: true,
    selectable: true
  },
  dirt: {
    texture: './textures/dirt.png',
    solid: true,
    selectable: true
  },
  stone: {
    texture: './textures/stone.png',
    solid: true,
    selectable: true
  },
  'carved-darkstone': {
    texture: './textures/carved-darkstone.png',
    solid: true,
    selectable: true
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
  [new Vector3(0, 1, 0), 'top', 'bottom'],
  [new Vector3(0, -1, 0), 'bottom', 'top'],
  [new Vector3(1, 0, 0), 'right', 'left'],
  [new Vector3(-1, 0, 0), 'left', 'right'],
  [new Vector3(0, 0, 1), 'front', 'back'],
  [new Vector3(0, 0, -1), 'back', 'front']
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

  showFace (face) {
    if (this.faces[face]) return
    const texture = this.texture(face)
    if (texture) {
      const global = this.chunk.pos.clone().scale(CHUNK_SIZE).add(this.pos)
      let plane
      if (face === 'top' || face === 'bottom') {
        const planeY = face === 'top' ? global.y + 1 : global.y
        plane = [
          global.x + 1, planeY, global.z + 1,
          global.x, planeY, global.z + 1,
          global.x, planeY, global.z,
          global.x + 1, planeY, global.z
        ]
      } else if (face === 'left' || face === 'right') {
        const planeX = face === 'right' ? global.x + 1 : global.x
        plane = [
          planeX, global.y + 1, global.z + 1,
          planeX, global.y + 1, global.z,
          planeX, global.y, global.z,
          planeX, global.y, global.z + 1
        ]
      } else if (face === 'front' || face === 'back') {
        const planeZ = face === 'front' ? global.z + 1 : global.z
        plane = [
          global.x + 1, global.y + 1, planeZ,
          global.x, global.y + 1, planeZ,
          global.x, global.y, planeZ,
          global.x + 1, global.y, planeZ
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
}

const CHUNK_SIZE = 16

class Subchunk {
  constructor (pos) {
    if (Subchunk.getChunk(pos)) {
      throw new Error('Chunk exists where I am!')
    }
    const { x, y, z } = pos
    Subchunk.subchunks[`${x},${y},${z}`] = this

    this.pos = pos
    this.blocks = new Array(CHUNK_SIZE ** 3).fill(null)
  }

  getChunk (offset) {
    return Subchunk.getChunk(this.pos.clone().add(offset))
  }

  inChunk ({ x, y, z }) {
    return x >= 0 && x < CHUNK_SIZE && y >= 0 && y < CHUNK_SIZE && z >= 0 && z < CHUNK_SIZE
  }

  getBlock (pos) {
    if (this.inChunk(pos)) {
      const { x, y, z } = pos
      return this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z]
    } else {
      return Subchunk.getGlobalBlock(this.pos.clone().scale(CHUNK_SIZE).add(pos))
    }
  }

  setBlock (pos, block) {
    if (!this.inChunk(pos)) {
      throw new Error('not my block!')
    }
    const oldBlock = this.getBlock(pos)
    if (oldBlock === block) return
    const { x, y, z } = pos
    if (oldBlock) {
      this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z].chunk = null
    }
    this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z] = block
    if (block) {
      block.chunk = this
      block.pos = pos
    }
    this.updateBlockFaces(pos)
  }

  updateBlockFaces (pos) {
    const block = this.getBlock(pos)
    const blockSolid = block && block.characteristics().solid
    for (const [offset, blockFace, neighbourFace] of neighbours) {
      const neighbour = this.getBlock(pos.clone().add(offset))
      const neighbourSolid = neighbour && neighbour.characteristics().solid
      if (blockSolid && neighbourSolid) {
        block.hideFace(blockFace)
        neighbour.hideFace(neighbourFace)
      } else {
        if (block) {
          block.showFace(blockFace)
        }
        if (neighbour) {
          neighbour.showFace(neighbourFace)
        }
      }
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

  static getChunk ({ x, y, z }) {
    return this.subchunks[`${x},${y},${z}`]
  }

  static blockToChunk ({ x, y, z }) {
    return new Vector3(
      Math.floor(x / CHUNK_SIZE),
      Math.floor(y / CHUNK_SIZE),
      Math.floor(z / CHUNK_SIZE)
    )
  }

  static getGlobalBlock (pos) {
    const subchunk = this.getChunk(this.blockToChunk(pos))
    if (subchunk) {
      const { x, y, z } = pos
      return subchunk.getBlock(new Vector3(mod(x, CHUNK_SIZE), mod(y, CHUNK_SIZE), mod(z, CHUNK_SIZE)))
    } else {
      return null
    }
  }

  static setGlobalBlock (pos, block) {
    const chunkPos = this.blockToChunk(pos)
    let subchunk = this.getChunk(chunkPos)
    if (!subchunk) {
      subchunk = new Subchunk(chunkPos)
    }
    const { x, y, z } = pos
    subchunk.setBlock(new Vector3(mod(x, CHUNK_SIZE), mod(y, CHUNK_SIZE), mod(z, CHUNK_SIZE)), block)
  }
}

Subchunk.subchunks = {}

function getT (anchor, dir, comp, value) {
  return (value - anchor[comp]) / dir[comp]
}
function parametric (anchor, dir, t) {
  return anchor.clone().add(dir.clone().scale(t))
}
function raycast (from, dir, onCollide, maxDist) {
  function getBlock ({ x, y, z }) {
    return new Vector3(
      (dir.x > 0 ? Math.floor : Math.ceil)(x),
      (dir.y > 0 ? Math.floor : Math.ceil)(y),
      (dir.z > 0 ? Math.floor : Math.ceil)(z)
    )
  }
  function adjustPos (block) {
    return block.clone().add({
      x: dir.x > 0 ? 0 : -1,
      y: dir.y > 0 ? 0 : -1,
      z: dir.z > 0 ? 0 : -1
    })
  }

  const initBlock = getBlock(from)
  const adjustedInitBlock = adjustPos(initBlock)
  if (onCollide(adjustedInitBlock)) {
    return { block: adjustedInitBlock, from: 'inside' }
  }

  let nextX = initBlock.x + Math.sign(dir.x)
  let nextXT = dir.x === 0 ? Infinity : getT(from, dir, 'x', nextX)
  let nextY = initBlock.y + Math.sign(dir.y)
  let nextYT = dir.y === 0 ? Infinity : getT(from, dir, 'y', nextY)
  let nextZ = initBlock.z + Math.sign(dir.z)
  let nextZT = dir.z === 0 ? Infinity : getT(from, dir, 'z', nextZ)
  while (true) {
    const t = Math.min(nextXT, nextYT, nextZT)
    if (t > maxDist) break
    const block = adjustPos(getBlock(parametric(from, dir, t)))
    if (onCollide(block)) {
      return {
        block,
        from: nextXT === t ? 'x' : nextYT === t ? 'y' : 'z'
      }
    }
    if (nextXT === t) {
      nextX += Math.sign(dir.x)
      nextXT = getT(from, dir, 'x', nextX)
    } else if (nextYT === t) {
      nextY += Math.sign(dir.y)
      nextYT = getT(from, dir, 'y', nextY)
    } else if (nextZT === t) {
      nextZ += Math.sign(dir.z)
      nextZT = getT(from, dir, 'z', nextZ)
    } else {
      throw new Error('How??')
    }
  }
  return null
}

const program = shaderProgram()
const selectedProgram = shaderProgram({
  vsSource: `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `,
  fsSource: `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 0.2);
    }
  `,
  attrs: [
    ['vertexPosition', 'aVertexPosition']
  ],
  uniforms: [
    ['projectionMatrix', 'uProjectionMatrix'],
    ['modelViewMatrix', 'uModelViewMatrix']
  ]
})
let buffers
let textureAtlas

const subchunk = new Subchunk(new Vector3(0, 0, 0))
textureAtlasPromise.then(createTexture)
  .then(texture => {
    textureAtlas = texture

    // TEMP "world gen"
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          subchunk.setBlock(new Vector3(x, y, z), new Block(y < 4 ? 'stone' : y < 7 ? 'dirt' : 'grass'))
        }
      }
    }
    subchunk.setBlock(new Vector3(3, 7, 3), null)

    render()
  })

const position = new Vector3(5, 10, 5)
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
document.addEventListener('mousedown', e => {
  if (mouseLocked) {
    keys[`mouse${e.which}`] = true
  }
})
document.addEventListener('mouseup', e => {
  keys[`mouse${e.which}`] = false
})

let speed = 5
document.addEventListener('wheel', e => {
  if (mouseLocked) {
    speed -= e.deltaY / 100
    if (speed < 0) speed = 0
  }
})

let lastTime = Date.now()
let selectedBlock = null
let nextDestroy = 0
let nextPlace = 0
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

  const raycastDir = new Vector3(0, 0, -1)
    .rotateAboutGlobalX(rotation.vertical)
    .rotateAboutGlobalY(rotation.lateral)
  const raycastCollision = raycast(position, raycastDir, pos => {
    const block = Subchunk.getGlobalBlock(pos)
    return block && block.characteristics().selectable
  }, 7)
  keys.r = false
  if (raycastCollision) {
    const { block: blockPos, from } = raycastCollision
    if (keys.mouse1 && now > nextDestroy) {
      Subchunk.setGlobalBlock(blockPos, null)
      nextDestroy = now + 100
    }
    if (keys.mouse3 && now > nextPlace) {
      if (from === 'x') {
        Subchunk.setGlobalBlock(blockPos.clone().add({ x: -Math.sign(raycastDir.x) }), new Block('carved-darkstone'))
      } else if (from === 'y') {
        Subchunk.setGlobalBlock(blockPos.clone().add({ y: -Math.sign(raycastDir.y) }), new Block('carved-darkstone'))
      } else if (from === 'z') {
        Subchunk.setGlobalBlock(blockPos.clone().add({ z: -Math.sign(raycastDir.z) }), new Block('carved-darkstone'))
      }
      nextPlace = now + 150
    }
    const block = Subchunk.getGlobalBlock(blockPos)
    if (!block && selectedBlock) {
      selectedBlock = null
    } else if (block && (!selectedBlock || selectedBlock.block !== block)) {
      const faces = [].concat(...Object.values(block.faces).map(({ plane }) => plane))
      selectedBlock = {
        block,
        buffers: faces.length ? makeBuffers(faces) : null
      }
    }
  } else if (selectedBlock) {
    selectedBlock = null
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
  mat4.translate(cameraMatrix, cameraMatrix, position.comps)
  mat4.rotate(cameraMatrix, cameraMatrix, -rotation.lateral, [0, 1, 0])
  mat4.rotate(cameraMatrix, cameraMatrix, -rotation.vertical, [1, 0, 0])
  mat4.invert(cameraMatrix, cameraMatrix)
  drawScene(program, buffers, cameraMatrix, { texture: textureAtlas })
  if (selectedBlock && selectedBlock.buffers) {
    drawScene(selectedProgram, selectedBlock.buffers, cameraMatrix, {
      clear: false,
      opacity: true
    })
  }

  window.requestAnimationFrame(render)
}
