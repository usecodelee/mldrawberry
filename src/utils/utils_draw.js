const transBerry = (faceWidth, x, y, dir) => {
  const size = { width: faceWidth / 6, height: faceWidth / 6 }
  if (dir == 'r') {
    return {
      ...size,
      x: x,
      y: y
    }
  } else {
    return {
      ...size,
      x: x - faceWidth / 5, //画在左边，需要移动一下起始位置
      y: y
    }
  }
}

// 获取图片
function getImg(src, cb) {
  const img = new Image()
  img.setAttribute('crossOrigin', 'anonymous')
  img.src = src
  img.onload = () => cb(img)
}

// 画草莓
function drawBerry(ctx, config, berryUrl) {
  const { angle, faceWidth, facePos } = config
  getImg(berryUrl, (img) => {
    ctx.save()
    // 移动画布原点到画草莓的位置
    ctx.translate(facePos.point.x, facePos.point.y)
    // 旋转草莓的角度和脸的角度一致
    ctx.rotate(angle)
    // 调整草莓的位置
    const { x, y, width, height } = transBerry(faceWidth, 0, 0, facePos.dir)
    ctx.drawImage(img, x, y, width, height)
    ctx.restore()
  })
}

// 绘制
function draw(canvas, options, berryUrl) {
  const { info, width, height, imgSrc } = options
  const ctx = canvas.getContext('2d')
  // 重置
  ctx.clearRect(0, 0, width, height)
  // 先把图片绘制上去
  getImg(imgSrc, (img) => {
    ctx.drawImage(img, 0, 0, width, height)
  })
  // 循环把帽子画到对应的点上
  for (let i = 0; i < info.length; i++) {
    drawBerry(ctx, info[i], berryUrl)
  }
}

export { draw }
