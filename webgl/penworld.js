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
    selectable: true,
    collidable: true
  },
  dirt: {
    texture: './textures/dirt.png',
    solid: true,
    selectable: true,
    collidable: true
  },
  stone: {
    texture: './textures/stone.png',
    solid: true,
    selectable: true,
    collidable: true
  },
  'carved-darkstone': {
    texture: './textures/carved-darkstone.png',
    solid: true,
    selectable: true,
    collidable: true
  },
  water: {
    texture: './textures/water.png',
    translucent: true
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
let translucentFaces = []

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
  constructor (pos, blocks=new Array(CHUNK_SIZE ** 3).fill(null), loading = false) {
    if (!loading && Subchunk.getChunk(pos)) { // if the game isn't loading a world and there is a subchunk
      throw new Error('Chunk exists where I am!')
    }
    const { x, y, z } = pos
    Subchunk.subchunks[`${x},${y},${z}`] = this

    this.pos = pos
    this.blocks = blocks
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
    const blockType = block && block.type
    const blockChars = block ? block.characteristics() : {}
    for (const [offset, blockFace, neighbourFace] of neighbours) {
      const neighbour = this.getBlock(pos.clone().add(offset))
      const neighbourType = neighbour && neighbour.type
      const neighbourChars = neighbour ? neighbour.characteristics() : {}
      if (blockChars.solid && neighbourChars.solid) {
        block.hideFace(blockFace)
        neighbour.hideFace(neighbourFace)
      } else {
        if (block) {
          // Translucent blocks will only show when adjacent to a non-solid
          // and non-it block
          if (blockChars.solid || !neighbourChars.solid && blockType !== neighbourType) {
            block.showFace(blockFace)
          } else {
            block.hideFace(blockFace)
          }
        }
        if (neighbour) {
          if (neighbourChars.solid || !blockChars.solid && neighbourType !== blockType) {
            neighbour.showFace(neighbourFace)
          } else {
            neighbour.hideFace(neighbourFace)
          }
        }
      }
    }
  }

  storeFacesIn (faces, textureCoords, translucentFaces) {
    for (const block of this.blocks) {
      if (block) {
        for (const { plane, coords } of Object.values(block.faces)) {
          if (block.characteristics().translucent) {
            translucentFaces.push({ plane, coords })
          } else {
            faces.push(...plane)
            textureCoords.push(...coords)
          }
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

// Sets velocity vector
function collide (pos, velocity, comp, size, aComp, aSize, bComp, bSize, onCollide) {
  if (velocity[comp] === 0) return null

  const minA = Math.floor(pos[aComp] - aSize + Number.EPSILON)
  const maxA = Math.ceil(pos[aComp] + aSize - Number.EPSILON)
  const minB = Math.floor(pos[bComp] - bSize + Number.EPSILON)
  const maxB = Math.ceil(pos[bComp] + bSize - Number.EPSILON)

  const stop = Math.abs(velocity[comp])
  const initPos = velocity[comp] > 0 ? pos[comp] + size : pos[comp] - size
  let val = Math.round(initPos)
  if (keys.r) {
    console.log('R')
    console.log(minA, maxA, minB, maxB)
    console.log(stop, initPos, val)
  }
  while (Math.abs(val - initPos) <= stop) {
    const block = new Vector3().set({ [comp]: velocity[comp] > 0 ? val : val - 1 })
    for (let a = minA; a < maxA; a++) {
      block.set({ [aComp]: a })
      for (let b = minB; b < maxB; b++) {
        block.set({ [bComp]: b })
        if (onCollide(block)) {
          if (keys.r) {
            console.log(val, initPos, val - initPos, pos[comp], (pos[comp] + val - initPos) - size)
          }
          velocity[comp] = val - initPos
          return block
        }
      }
    }
    val += Math.sign(velocity[comp])
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
    subchunk.setBlock(new Vector3(3, 7, 4), new Block('water'))

    render()
  })

const PLAYER_HEIGHT = 1.8
const EYE_HEIGHT = 1.6
const PLAYER_RADIUS = 0.4
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

const isCollidable = pos => {
  const block = Subchunk.getGlobalBlock(pos)
  return block && block.characteristics().collidable
}

let lastTime = Date.now()
let currentBlock = 'carved-darkstone'
let selectedBlock = null
let nextDestroy = 0
let nextPlace = 0
function render () {
  const now = Date.now()
  const elapsedTime = (now - lastTime) / 1000
  lastTime = now
  
  // allows user to select currentBlock
  for (let i=0; i<Object.keys(blocks).length; i++) { // iterate over blocks
    // 0 is air so don't add 1 to i
    if (keys[i]) { // if index of block pressed
      currentBlock = Object.keys(blocks)[i]; // set current block
    }
  }

  if (elapsedTime < 0.1) {
    const velocity = new Vector3()
    if (keys.shift) {
      velocity.y -= elapsedTime * speed
    }
    if (keys[' ']) {
      velocity.y += elapsedTime * speed
    }
    const movement = new Vector2()
    if (keys.a) movement.add({x: -1})
    if (keys.d) movement.add({x: 1})
    if (keys.w) movement.add({y: -1})
    if (keys.s) movement.add({y: 1})
    if (movement.length) {
      const { x, y } = movement.unit().scale(elapsedTime * speed).rotate(rotation.lateral)
      velocity.x += x
      velocity.z += y
    }
    const playerCentre = position.clone().set({
      y: position.y - EYE_HEIGHT + PLAYER_HEIGHT / 2
    })
    collide(playerCentre, velocity, 'y', PLAYER_HEIGHT / 2, 'x', PLAYER_RADIUS, 'z', PLAYER_RADIUS, isCollidable)
    collide(playerCentre, velocity, 'x', PLAYER_RADIUS, 'y', PLAYER_HEIGHT / 2, 'z', PLAYER_RADIUS, isCollidable)
    collide(playerCentre, velocity, 'z', PLAYER_RADIUS, 'y', PLAYER_HEIGHT / 2, 'x', PLAYER_RADIUS, isCollidable)
    position.add(velocity)
  }

  const raycastDir = new Vector3(0, 0, -1)
    .rotateAboutGlobalX(rotation.vertical)
    .rotateAboutGlobalY(rotation.lateral)
  const raycastCollision = raycast(position, raycastDir, pos => {
    const block = Subchunk.getGlobalBlock(pos)
    return block && block.characteristics().selectable
  }, 7)
  if (raycastCollision) {
    const { block: blockPos, from } = raycastCollision
    if (keys.mouse1 && now > nextDestroy) {
      Subchunk.setGlobalBlock(blockPos, null)
      nextDestroy = now + 100
    }
    if (keys.mouse3 && now > nextPlace) {
      if (from === 'x') {
        Subchunk.setGlobalBlock(blockPos.clone().add({ x: -Math.sign(raycastDir.x) }), new Block(currentBlock))
      } else if (from === 'y') {
        Subchunk.setGlobalBlock(blockPos.clone().add({ y: -Math.sign(raycastDir.y) }), new Block(currentBlock))
      } else if (from === 'z') {
        Subchunk.setGlobalBlock(blockPos.clone().add({ z: -Math.sign(raycastDir.z) }), new Block(currentBlock))
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
    translucentFaces = []
    for (const subchunk of Object.values(Subchunk.subchunks)) {
      subchunk.storeFacesIn(faces, textureCoords, translucentFaces)
    }
    buffers = makeBuffers(faces, textureCoords)
    facesChanged = false
  }

  const cameraMatrix = mat4.create()
  mat4.translate(cameraMatrix, cameraMatrix, position.comps)
  mat4.rotate(cameraMatrix, cameraMatrix, -rotation.lateral, [0, 1, 0])
  mat4.rotate(cameraMatrix, cameraMatrix, -rotation.vertical, [1, 0, 0])
  mat4.invert(cameraMatrix, cameraMatrix)
  drawScene(program, buffers, cameraMatrix, { texture: textureAtlas })

  // Get the furthest (most negative) transformed z for each translucent face
  for (const translucent of translucentFaces) {
    const vertex = vec3.create()
    translucent._z = Infinity
    for (let i = 0; i < translucent.plane.length; i += 4) {
      vec3.set(vertex, ...translucent.plane.slice(i, i + 4))
      vec3.transformMat4(vertex, vertex, cameraMatrix)
      if (vertex[2] < translucent._z) {
        translucent._z = vertex[2]
      }
    }
  }
  // Insertion sort because it's efficient when the array has already been sorted
  // Sorting from furthest to closest (- -> +)
  for (let i = 1; i < translucentFaces.length; i++) {
    const translucent = translucentFaces[i]
    let j = i - 1
    while (j >= 0 && translucentFaces[j]._z > translucent._z) {
      j--
    }
    if (j < i - 1) {
      // This way it shifts all the items in between up instead of having to swap
      // each item manually
      translucentFaces.splice(i, 1)
      translucentFaces.splice(j + 1, 0, translucent)
    }
  }
  drawScene(program, makeBuffers(
    [].concat(...translucentFaces.map(({ plane }) => plane)),
    [].concat(...translucentFaces.map(({ coords }) => coords))
  ), cameraMatrix, { texture: textureAtlas, opacity: true, clear: false })

  if (selectedBlock && selectedBlock.buffers) {
    drawScene(selectedProgram, selectedBlock.buffers, cameraMatrix, {
      clear: false,
      opacity: true
    })
  }

  window.requestAnimationFrame(render)
}

/*

Lists use a smaller amount of data than objects.

{"x":x,"y":y,"z":z}
[x,y,z]

*/

function vectorToList(v) {
  return [v.x, v.y, v.z];
}

function vectorFromList(l) {
  return new Vector3( ...l );
}

function save() {
  
  const data = Subchunk.subchunks; // world data
  const chunks = Object.keys(data); // chunks
  let result = {}; // resulting data
  
  for (let i=0; i<chunks.length; i++) { // iterate over chunks
    const index = chunks[i];
    const chunk = data[index]; // choose current chunk
    
    result[index] = [vectorToList(chunk.pos), []]; // converts Vector3 to list
    let rBlocks = result[index][1]; // blocks
    
    const chunkBlocks = chunk.blocks; // get blocks
    let repeatingAir = 0;
    
    for (let j=0; j<chunkBlocks.length; j++) { // iterate over blocks
      const block = chunkBlocks[j]; // choose current block
      
      // don't store chunk or faces because they're redundant
      if (block !== null) { // if it's not null
        if (repeatingAir > 0) {
          rBlocks.push(repeatingAir);
          repeatingAir = 0;
        }
        // Object.keys(blocks).indexOf(block.type) to make it smaller
        rBlocks.push([vectorToList(block.pos), Object.keys(blocks).indexOf(block.type)]);
      } else { // bad idea but i'm lazy and i'll work on it tomorrow
        repeatingAir += 1;
      }
    }
    
    while (rBlocks[rBlocks.length - 1] === 0) { // removes air at end of subchunk
      rBlocks.pop();
    }
  }
  
  result.version = 1;
  
  return JSON.stringify(result);
}

function load(data) {
  data = JSON.parse(data);
  delete data.version;
  const chunks = Object.keys(data); // chunks
  
  for (let i=0; i<chunks.length; i++) {
    const index = chunks[i];
    const chunk = data[index]; // choose current chunk
    
    data[index] = new Subchunk(vectorFromList(chunk[0]), [], true)
    
    const chunkBlocks = chunk[1]; // get blocks
    for (let j=0; j<chunkBlocks.length; j++) { // iterate over blocks
      const block = chunkBlocks[j]; // choose current block
      if (block === 0) {
        data[index].blocks.push(null);
      } else if (typeof block === "number") {
        for (let k=0; k<block; k++) {
          data[index].blocks.push(null);
        }
      } else {
        // Object.keys(blocks)[block[1]] is because block[1] is a key of blocks
        let b = new Block(Object.keys(blocks)[block[1]]);
        data[index].blocks.push(b);
        b.pos = vectorFromList(block[0]);
        b.chunk = data[index];
        // b.faces is initialized already
      }
    }
    
    while (data[index].blocks.length < 4096) { // adds back air at end of subchunk
      data[index].blocks.push(null);
    }
    
    data[index].blocks.forEach((b) => {
      if (b !== null) {
        data[index].updateBlockFaces(b.pos); // updates faces
      }
    })
  }
  
  Subchunk.subchunks = data; // put it back in its place
  
}
