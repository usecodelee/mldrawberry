<template>
  <section>
    <img src="../img/berry.png" alt="" ref="hatimg" v-show="false">
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
import * as faceapi from "face-api.js";
import { getBerry } from "../utils/utils_calculate";
import { draw } from "../utils/utils_draw";
export default {
  name: "face",
  data() {
    return {
      loading: true,
      loading_font: "",
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
      const dataUrl = canvas.toDataURL("image/png");
      this.saveFile(dataUrl, "avatar.png");
    },
    saveFile(data, filename) {
      const save_link = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "a"
      );
      save_link.href = data;
      save_link.download = filename;

      const event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        "click",
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
        alert("错误");
      }
    },
    async updateResults() {
      this.loading = true;
      this.loading_font = "正在识别图像···";
      let input = this.$refs.inputImg;
      let canvas = this.$refs.overlay;
      const minConfidence = 0.8;
      let fullFaceDescriptions = await faceapi
        .detectAllFaces(input)
        .withFaceLandmarks()
        .withFaceDescriptors();
      faceapi.matchDimensions(canvas, input); // 让画布和图片一样大
      const displaySize = { width: input.width, height: input.height };
      const resizedDetections = faceapi.resizeResults(
        fullFaceDescriptions,
        displaySize
      );
      // const jawOutline = resizedDetections[0].landmarks.getJawOutline(); // 脸颊是从左往右 17个点
      // const nose = resizedDetections[0].landmarks.getNose(); // 鼻子是从上往下画的 9个点
      // const mouth = resizedDetections[0].landmarks.getMouth(); //嘴巴分 20个点 上嘴唇8个点 第九个是嘴唇最下面
      // const leftEye = resizedDetections[0].landmarks.getLeftEye(); //左眼 6个点 从左往右
      // const rightEye = resizedDetections[0].landmarks.getRightEye(); //右眼 6个点 从左往右
      // const leftEyeBbrow = resizedDetections[0].landmarks.getLeftEyeBrow(); //左眉毛 5个点 从左往右
      // const rightEyeBrow = resizedDetections[0].landmarks.getRightEyeBrow(); //右眉毛 5个点 从左往右
      // let ctx=canvas.getContext("2d");
      // faceapi.draw.drawContour(ctx, rightEyeBrow.slice(0,2),false);
      // faceapi.draw.drawDetections(canvas, resizedDetections); // 画框
      // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); // 画点
      const info = getBerry(resizedDetections);
      let hatUrl = this.$refs.hatimg.src;
      this.loading_font = "正在绘制图像···";
      this.loading = false;
      draw(
        canvas,
        {
          info,
          imgSrc: input.src,
          width: canvas.width,
          height: canvas.height
        },
        hatUrl
      );
      this.originImg = false;
      this.saveBtn = true;
    },
    async run() {
      this.loading_font = "正在载入模型···";
      const MODEL_URL = "/models";
      await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
      await faceapi.loadFaceLandmarkModel(MODEL_URL);
      await faceapi.loadFaceRecognitionModel(MODEL_URL);
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
  // overflow: hidden;
  transform: translate(-50%, -50%);
  img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
  }
  canvas {
    // position: absolute;
    // left: 0;
    // top: 0;
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
