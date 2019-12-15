const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')

textureAtlasPromise.then(canvas => {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
  return texture
})
