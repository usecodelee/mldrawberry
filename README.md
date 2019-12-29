@[toc]

# 前端机器学习--识别人脸在脸颊上画草莓

## 一、最终结果
![在这里插入图片描述](https://img-blog.csdnimg.cn/2019122909442879.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Nhb21hZ2U=,size_16,color_FFFFFF,t_70 =300x)![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229094248395.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Nhb21hZ2U=,size_16,color_FFFFFF,t_70 =300x)
急性子想直接食用的点这个：**[源码地址](https://github.com/usecodelee/mldrawberry)**
## 二、原理

要在用户上传的人脸上画草莓，会面临几个问题：  
1. 在哪儿画？
2. 画多大？
3. 草莓的角度和脸的角度是否一致？

基于这些问题，就不得不使用机器学习来解决了！

### 1. 前端的机器学习

提起前端的机器学习，首先想到的就是Google的[TensorFlow](https://tensorflow.google.cn/)：  
> TensorFlow 是一个端到端开源机器学习平台。它拥有一个包含各种工具、库和社区资源的全面灵活生态系统，可以让研究人员推动机器学习领域的先进技术的发展，并让开发者轻松地构建和部署由机器学习提供支持的应用。  

有兴趣的可以去[TensorFlow官网](https://tensorflow.google.cn/)看看，有很多好玩的东西。  

当然，我们仅仅是使用人脸识别，那有人已经在TensorFlow的基础上封装了专门针对人脸识别的库 [face-api.js](https://github.com/justadudewhohacks/face-api.js)

### 2. 基本原理
我只是大体说一下，我只是一个感兴趣的可以去看看具体的内容。
1. 第一步：找出所有的面孔
> 解决方案HOG（Histogram of Oriented Gradients）方向梯度直方图，一种能够检测物体轮廓的算法。
2. 第二步：脸部的不同姿势
> 使用由瓦希德·卡奇米（Vahid Kazemi）和约瑟菲娜·沙利文（Josephine Sullivan）在 2014 年发明的一种面部特征点估计（face landmark estimation）算法。

这一算法的基本思路是找到68个人脸上普遍存在的点（称为特征点， landmark）：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229095337229.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Nhb21hZ2U=,size_16,color_FFFFFF,t_70)
其中：
> 下巴轮廓17个点 [0-16]
左眉毛5个点 [17-21]
右眉毛5个点 [22-26]
鼻梁4个点 [27-30]
鼻尖5个点 [31-35]
左眼6个点 [36-41]
右眼6个点 [42-47]
外嘴唇12个点 [48-59]
内嘴唇8个点 [60-67]  

有了这68个点，我们就可以轻松的知道眉毛、眼睛、鼻子和嘴巴的位置信息了，根据这些位置信息，我们经过一些简单的计算就可以得出开始提到的这几个问题的答案：
> 1. 在哪儿画？
> 2. 画多大？
> 3. 草莓的角度和脸的角度是否一致？



## 三、基于`vue-cli`搞一个
有了[face-api.js](https://github.com/justadudewhohacks/face-api.js)我们就可以动手开始搞了。大体上分为4步：
> 1. 使用`vue-cli`脚手架搭建项目
> 2. 使用`face-api.js`检测人脸图片，获取检测结果
> 3. 计算（草莓大小、位置、旋转角度等）
> 4. 画草莓

### 1. 使用`vue-cli`脚手架搭建项目
使用`vue-cli`快速[创建一个项目](https://cli.vuejs.org/zh/guide/creating-a-project.html)

### 2. 使用`face-api.js`检测人脸图片，获取检测结果
#### (1)安装`face-api.js`
 ```bash
 npm i face-api.js
 ```
 
 #### (2)加载模型数据
 
 使用`face-api.js`是不需要我们自己慢慢训练的，可以直接使用`models`。  
 你可以根据应用程序的要求加载你需要的特定模型。但是如果要运行一个完整的端到端的示例，我们还需要加载人脸检测、人脸特征点检测和人脸识别模型。相关的模型文件可以在[代码仓库](https://github.com/justadudewhohacks/face-api.js/tree/master/weights)中找到。我们将它们放在`public/models`文件夹下并导入:  
 ```javascript
 const MODEL_URL = "/models";
 await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
 await faceapi.loadFaceLandmarkModel(MODEL_URL);
 await faceapi.loadFaceRecognitionModel(MODEL_URL);
 ```
 将`face-api.js`导入我们的组件：
 ```javascript 
 import * as faceapi from "face-api.js";
 ```
#### (3)使用`face-api.js`检测人脸图片，获取检测结果
```javascript
let input = this.$refs.inputImg; // 待检测的图片
let canvas = this.$refs.overlay; // 等下画检测结果的画布
const minConfidence = 0.8;
let fullFaceDescriptions = await faceapi
  .detectAllFaces(input)
  .withFaceLandmarks()
  .withFaceDescriptors(); // 检测图片
faceapi.matchDimensions(canvas, input); // 让画布和图片一样大
const displaySize = { width: input.width, height: input.height };
const resizedDetections = faceapi.resizeResults(
  fullFaceDescriptions,
  displaySize
); // 调整检测结果和输入图片像素
```
### 3. 计算（草莓位置、大小、倾斜弧度等）
#### (1)获取脸上元素的特征点数组
```javascript
// 脸颊是从左往右 17个点
const jawOutline = resizedDetections[0].landmarks.getJawOutline(); 
// 鼻子是从上往下画的 9个点
const nose = resizedDetections[0].landmarks.getNose(); 
//嘴巴分 20个点
const mouth = resizedDetections[0].landmarks.getMouth(); 
//左眼 6个点 从左往右
const leftEye = resizedDetections[0].landmarks.getLeftEye();
//右眼 6个点 从左往右 
const rightEye = resizedDetections[0].landmarks.getRightEye(); 
//左眉毛 5个点 从左往右
const leftEyeBbrow = resizedDetections[0].landmarks.getLeftEyeBrow(); 
//右眉毛 5个点 从左往右
const rightEyeBrow = resizedDetections[0].landmarks.getRightEyeBrow(); 
faceapi.draw.drawDetections(canvas, resizedDetections); // 画框
faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); // 画点
```
画出来的结果如图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229104446743.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Nhb21hZ2U=,size_16,color_FFFFFF,t_70#pic_center =500x)
#### (2)获取草莓位置
草莓的位置获取，先看下面这张图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229112530317.jpeg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Nhb21hZ2U=,size_16,color_FFFFFF,t_70#pic_center =500x)
先比较左右黄色和绿色两条线的长度，哪边长就画在哪边（考虑可能照片是侧着脸的），具体的位置左右不一样，右边绿色的线直接从线的中点开始画，而左边黄色的线则是在线的中点再往左边偏移草莓宽度的一半开始画。
大概如图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20191229113124207.jpeg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2Nhb21hZ2U=,size_16,color_FFFFFF,t_70#pic_center =500x)
所以是先获取点32和点16的距离，再获取中点：
```javascript
//  获取两点之间距离
const getDistance = (a, b) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}
//  获取两点之间的中点
const getMidPoint = (pa, pb) => ({
  x: (pa.x + pb.x) / 2,
  y: (pa.y + pb.y) / 2
})
```
#### (3)获取草莓大小
草莓的大小可以估计一下，大概是整个脸宽的`1/6`：
```javascript
const size = { width: faceWidth / 6, height: faceWidth / 6 }
```
#### (4)获取草莓倾斜弧度
我们可以根据眉毛的中点和下颚的最低点两个点计算出脸的弧度，即草莓的弧度：
```javascript
// 获取脸的倾斜弧度
const getFaceRadian = (jawPos, midPointOfEyebrows) =>
  Math.PI -
  Math.atan2(jawPos.x - midPointOfEyebrows.x, jawPos.y - midPointOfEyebrows.y)
```
### 4. 画草莓
有了前面的内容，画草莓就简单了。先将原图画上去，再在原图的基础上画上草莓：
```javascript
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
// 获取图片
function getImg(src, cb) {
  const img = new Image()
  img.setAttribute('crossOrigin', 'anonymous')
  img.src = src
  img.onload = () => cb(img)
}
```
限于篇幅，文中只提及了部分重点代码，需要看完整代码的可以点[这里](https://github.com/usecodelee/mldrawberry)。

