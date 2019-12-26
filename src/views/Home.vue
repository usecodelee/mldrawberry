<template>
  <section>
    <img src="../img/hat1.png" alt="" ref="hatimg" v-show="false">
    <input v-show="false" ref="fileInput" type='file' id="file-input" @change="readURL" accept="image/*" />
    <div class="ml-main">
      <img src="../img/2.jpg" alt="" ref="inputImg" v-show="originImg">
      <canvas id="overlay" ref="overlay"></canvas>
    </div>
    <div class="btn-group">
      <button @click="upload">上传图片</button>
      <button @click="save" v-if="saveBtn">保存图片</button>
    </div>
    <div class="loading-main" id="loading" v-if="loading">
      <div class="loading-div">
        <img src="../img/loading.gif" class="loading-icon" />
        {{loading_font}}···
      </div>
    </div>
  </section>
</template>
<script>
import * as faceapi from 'face-api.js';
import { userConfig } from '../config/config';
import { getHatInfo } from '../utils/utils_with_face_width';
import { drawing } from '../utils/drawing';
const MODEL_PATH = '/models';
const SSD_MOBILENETV1 = 'ssd_mobilenetv1';
const TINY_FACE_DETECTOR = 'tiny_face_detector';
var selectedFaceDetector = SSD_MOBILENETV1;
export default {
  data() {
    return {
      loading: true,
      loading_font: '',
      originImg: true,
      saveBtn: false
    };
  },
  methods: {
    upload() {
      this.$refs.fileInput.click();
    },
    save() {
      let canvas = this.$refs.overlay;
      const dataUrl = canvas.toDataURL('image/png');
      this.saveFile(dataUrl, 'avatar.png');
    },
    saveFile(data, filename) {
      const save_link = document.createElementNS(
        'http://www.w3.org/1999/xhtml',
        'a'
      );
      save_link.href = data;
      save_link.download = filename;

      const event = document.createEvent('MouseEvents');
      event.initMouseEvent(
        'click',
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      save_link.dispatchEvent(event);
    },
    readURL(input) {
      if (input.target.files && input.target.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          this.$refs.inputImg.src = e.target.result;
          this.updateResults();
        };
        reader.readAsDataURL(input.target.files[0]);
      } else {
        alert('错误');
      }
    },
    isFaceDetectionModelLoaded() {
      return !!this.getCurrentFaceDetectionNet().params;
    },
    async updateResults() {
      this.loading = true;
      this.loading_font = '正在识别图像···';
      let canvas = this.$refs.overlay;
      let inputImg = this.$refs.inputImg;
      if (!this.isFaceDetectionModelLoaded()) {
        return;
      }
      const results = await faceapi
        .detectAllFaces(inputImg)
        .withFaceLandmarks();
      faceapi.matchDimensions(canvas, inputImg);
      const resizedResults = faceapi.resizeResults(results, inputImg);
      const info = getHatInfo(resizedResults);
      faceapi.draw.drawFaceLandmarks(canvas, resizedResults); // 直接画出识别的的特征点
      let hatUrl = this.$refs.hatimg.src;
      this.loading_font = '正在绘制图像···';
      this.loading = false;
      this.originImg = false;
      drawing(
        canvas,
        {
          info,
          imgSrc: inputImg.src,
          width: canvas.width,
          height: canvas.height
        },
        hatUrl
      );
      this.saveBtn = true;
    },
    getCurrentFaceDetectionNet() {
      if (selectedFaceDetector === SSD_MOBILENETV1) {
        return faceapi.nets.ssdMobilenetv1;
      }
      if (selectedFaceDetector === TINY_FACE_DETECTOR) {
        return faceapi.nets.tinyFaceDetector;
      }
    },
    async run() {
      this.loading_font = '正在载入模型···';
      // 初始化face-api 这里使用ssd moblile
      await this.getCurrentFaceDetectionNet().load(MODEL_PATH);
      // 加载Landmark模型
      await faceapi.loadFaceLandmarkModel(MODEL_PATH);
      // 更新数据
      this.updateResults();
    }
  },
  mounted() {
    this.run();
  }
};
</script>
<style lang="scss" scoped>
.ml-main {
  width: 600px;
  height: 500px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 45%;
  overflow: hidden;
  transform: translate(-50%, -50%);
  img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
  }
  canvas {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
  }
}
.btn-group {
  width: 50%;
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  margin-top: 100px;
  button {
    border: none;
    padding: 20px;
    box-shadow: 0 0 10px #ccc;
  }
}
.loading-main {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  .loading-div {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 900;
  }
}
</style>
