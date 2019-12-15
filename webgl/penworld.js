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
      resolve(image)
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
      c.drawImage(images[i], i % columns * textureSize, (i / columns | 0) * textureSize)
    }
    return canvas
  })

class Block {
  constructor (type) {
    this.type = type
  }

  characteristics () {
    return blocks[this.type] || {}
  }

  isSolid () {
    return this.characteristics().solid
  }

  updateFaces () {
    // TODO: Should update a master Float32Array to show/hide faces for maximum efficiency!
    const amSolid = this.isSolid()
  }
}

const CHUNK_SIZE = 16
const subchunks = {}

class Subchunk {
  constructor (x, y, z) {
    if (subchunks[`${x},${y},${z}`]) throw new Error('Chunk exists where I am!')
    subchunks[`${x},${y},${z}`] = this

    this.x = x
    this.y = y
    this.z = z
    this.blocks = new Array(CHUNK_SIZE ** 3).fill(null)
    this.visibleFaces = []
  }

  getChunk (offsetX = 0, offsetY = 0, offsetZ = 0) {
    const { x, y, z } = this
    return subchunks[`${x + offsetX},${y + offsetY},${z + offsetZ}`]
  }

  getBlock (x, y, z) {
    return this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z]
  }

  setBlock (x, y, z, block) {
    if (this.getBlock(x, y, z)) {
      this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z].chunk = null
    }
    this.blocks[(y * CHUNK_SIZE + x) * CHUNK_SIZE + z] = block
    block.chunk = this
    block.x = x
    block.y = y
    block.z = z
    block.updateFaces()
  }
}

const subchunk = new Subchunk(0, 0, 0)
for (let y = 0; y < 8; y++) {
  for (let x = 0; x < CHUNK_SIZE; x++) {
    for (let z = 0; z < CHUNK_SIZE; z++) {
      subchunk.setBlock(x, y, z, new Block(y < 4 ? 'stone' : y < 6 ? 'dirt' : 'grass'))
    }
  }
}
