//  获取中间的点
const getMedian = (points) => points[Math.floor(points.length / 2)]

//  获取两点之间的中点
const getMidPoint = (pa, pb) => ({
  x: (pa.x + pb.x) / 2,
  y: (pa.y + pb.y) / 2
})

//  获取两点之间距离
const getDistance = (a, b) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

//  获取两个眉毛中点
const getMidPointOfEyebrows = (leftPoints, rightPoints) =>
  getMidPoint(leftPoints[leftPoints.length - 1], rightPoints[0])

//  获取下颌的最低点
const getJawPos = (jawPoints) => getMedian(jawPoints)

const distanceOfPoint = (point, a, b, c) =>
  Math.abs(a * point.y + b * point.x + c) / Math.sqrt(a * a + b * b)

// 获取脸的宽度（用来计算草莓的大小）
const getFaceWith = (outlinePoints, jawPos, midPointOfEyebrows) => {
  let k = getK(jawPos, midPointOfEyebrows)
  let b = jawPos.x - k * jawPos.y

  let leftWidth = distanceOfPoint(outlinePoints[0], k, -1, b)
  let rightWidth = distanceOfPoint(
    outlinePoints[outlinePoints.length - 1],
    k,
    -1,
    b
  )
  return leftWidth > rightWidth ? rightWidth * 2 : leftWidth * 2
}

// 获取脸的倾斜弧度
const getFaceRadian = (jawPos, midPointOfEyebrows) =>
  Math.PI -
  Math.atan2(jawPos.x - midPointOfEyebrows.x, jawPos.y - midPointOfEyebrows.y) // 弧度

// 获取脸上画草莓的坐标
const getfacePos = (nosePoints, outlinePoints) => {
  var distanceR = getDistance(nosePoints[8], outlinePoints[16])
  var distanceL = getDistance(nosePoints[8], outlinePoints[0])
  if (distanceR >= distanceL) {
    return { point: getMidPoint(nosePoints[8], outlinePoints[16]), dir: 'r' }
  } else {
    return { point: getMidPoint(nosePoints[8], outlinePoints[0]), dir: 'l' }
  }
}

// 斜率
const getK = (a, b) => (a.x - b.x) / (a.y - b.y)

function getFace(outline, nose, leftEye, rightEye) {
  // 获取眉心的点
  const midPointOfEyebrows = getMidPointOfEyebrows(leftEye, rightEye)
  // 获取下颌的点
  const jawPos = getJawPos(outline)
  // 获取脸的倾斜角度
  const angle = getFaceRadian(midPointOfEyebrows, jawPos)
  // 获取脸宽
  const faceWidth = getFaceWith(outline, jawPos, midPointOfEyebrows)
  // 获取脸上画草莓的坐标
  const facePos = getfacePos(nose, outline)
  return { angle, faceWidth, facePos }
}

function getBerry(detections) {
  return detections.map(({ landmarks }) => {
    const outlinePoints = landmarks.getJawOutline() // 获取轮廓
    const nosePoints = landmarks.getNose() // 获取鼻子
    const rightEyebrowPoints = landmarks.getRightEyeBrow() // 获取右边眉毛
    const leftEyebrowPoints = landmarks.getLeftEyeBrow() // 获取左边眉毛
    return getFace(
      outlinePoints,
      nosePoints,
      leftEyebrowPoints,
      rightEyebrowPoints
    )
  })
}
export { getBerry }
