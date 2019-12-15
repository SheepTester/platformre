function isPowerOf2 (n) {
  return (n & (n - 1)) === 0
}

function happyWebGL (canvas) {
  const gl = canvas.getContext('webgl')

  function loadShader (type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error('shader compile wucky: ' + error)
    }
    return shader
  }

  return {
    updateSize () {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    },

    makeProgram (vsSource, fsSource, attributes, uniforms) {
      const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource)
      const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource)

      const shaderProgram = gl.createProgram()
      gl.attachShader(shaderProgram, vertexShader)
      gl.attachShader(shaderProgram, fragmentShader)
      gl.linkProgram(shaderProgram)

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error('shader program wucky: ' + gl.getProgramInfoLog(shaderProgram))
      }

      const attrLocs = {}
      for (const attr of attributes) {
        attrLocs[attr] = gl.getAttribLocation(shaderProgram, attr)
      }
      const uniformLocs = {}
      for (const uniform of uniforms) {
        uniformLocs[uniform] = gl.getUniformLocation(shaderProgram, uniform)
      }
      return {
        program: shaderProgram,
        attrLocs,
        uniformLocs
      }
    },

    loadTexture (url) {
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)

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
        new Uint8Array([255, 193, 7, 255])
      )

      const image = new Image()
      image.onload = e => {
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)

        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D)
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
      }
      image.src = url

      return texture
    },

    // `planes` is an array of arrays of the four corner vertices for each
    // plane.
    // Leave `colours` as null for texture; otherwise, it's an array of arrays
    // of three integers between 0 and 255 representing a RGB colour
    createPlanes (planes, colours = null) {
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([].concat(...planes)),
        gl.STATIC_DRAW
      )

      let colourBuffer, textureCoordBuffer
      if (colours) {
        colours = colours.map(c => [...c.map(ch => ch / 255), 1])
        const colourTable = []
        for (const colour of colours) {
          // Four times for each vertex of face
          colourTable.push(...colour, ...colour, ...colour, ...colour)
        }

        colourBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colourTable), gl.STATIC_DRAW)
      } else {
        const textureCoordinates = []
        for (let i = 0; i < planes.length; i++) {
          textureCoordinates.push(0, 0, 1, 0, 1, 1, 0, 1)
        }

        textureCoordBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW)
      }

      const indices = []
      for (let i = 0; i < planes.length; i++) {
        indices.push(i * 4, i * 4 + 1, i * 4 + 2)
        indices.push(i * 4, i * 4 + 3, i * 4 + 2)
      }

      const indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

      return {
        position: positionBuffer,
        colour: colourBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: indices.length
      }
    },

    clear (colour = [0, 0, 0]) {
      gl.clearColor(...colour.map(ch => ch / 255), 1)
      gl.clearDepth(1.0)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.clear(gl.COLOR_BUFFER_BIT)
    },

    render ({
      program: {program, attrLocs, uniformLocs},
      projectionMatrix,
      modelMatrix,
      planes: {position, colour, textureCoord, indices, vertexCount},
      texture
    }) {
      gl.useProgram(program)

      gl.bindBuffer(gl.ARRAY_BUFFER, position)
      gl.vertexAttribPointer(attrLocs.vertexPosition, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(attrLocs.vertexPosition)

      if (textureCoord) {
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoord)
        gl.vertexAttribPointer(attrLocs.textureCoord, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(attrLocs.textureCoord)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(uniformLocs.uSampler, 0)
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, colour)
        gl.vertexAttribPointer(attrLocs.vertexColour, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(attrLocs.vertexColour)
      }

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices)

      gl.uniformMatrix4fv(
        uniformLocs.projectionMatrix,
        false,
        projectionMatrix
      )
      gl.uniformMatrix4fv(
        uniformLocs.modelViewMatrix,
        false,
        modelMatrix
      )

      // vertexCount?
      gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0)
    }
  }
}
