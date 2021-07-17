var utils = require(Editor.url('packages://pngquant/utils/utils'));
var child_process = require('child_process');
var path = require('path');
var fs = require('fs');

Editor.Panel.extend({
  // css style for panel
  style: `

  `,

  // html template for panel
  template: `
    <head>
      <ui-prop name="项目发布的文件夹（图片压缩完了不可逆）">
        <ui-input v-bind:value="project" v-on:change="inputTargetPath"></ui-input>
      </ui-prop>
      <ui-prop name="压缩上限（图片压缩的质量如果大于该参数将不会采用）">
        <ui-select v-bind:value="qualityMax" v-on:change="selectQualityMax">
          <option value="30">30</option>
          <option value="35">35</option>
          <option value="40">40</option>
          <option value="45">45</option>
          <option value="50">50</option>
          <option value="55">55</option>
          <option value="60">60</option>
          <option value="65">65</option>
          <option value="70">70</option>
          <option value="75">75</option>
          <option value="80">80</option>
          <option value="85">85</option>
          <option value="90">90</option>
          <option value="99">99</option>
        </ui-select>
      </ui-prop>
      <ui-prop name="压缩下限（图片压缩的质量如果小于该参数将不会采用）">
        <ui-select v-bind:value="qualityMin" v-on:change="selectQualityMin">
          <option value="5">5</option>
          <option value="30">30</option>
          <option value="35">35</option>
          <option value="40">40</option>
          <option value="45">45</option>
          <option value="50">50</option>
          <option value="55">55</option>
          <option value="60">60</option>
          <option value="65">65</option>
          <option value="70">70</option>
          <option value="75">75</option>
          <option value="80">80</option>
          <option value="85">85</option>
          <option value="90">90</option>
        </ui-select>
      </ui-prop>
      <ui-prop name="压缩进度条">
          <ui-progress style="width: 90%;" v-value="progress">0</ui-progress>
      </ui-prop>
      <ui-button id="start" v-on:confirm="startCompression">${Editor.T(
        'pngquant.start'
      )}</ui-button>
      <hr/>
        <div style="overflow:scroll;height:100%">
            <div v-for="item of list" id="item">
                <div class="info">
                    <img src="" v-bind:src="item.path" alt="" width="50" height="50">
                    <span>
                        {{item.name}}
                    </span>
                    <span>
                      {{item.before_size}}B
                    </span
                </div>
            </div>
        </div>

      <div>
    </head>
  `,

  dependencies: [
    'packages://pngquant/lib/jquery.min.js',
    'packages://pngquant/lib/vendor.bundle.js'
  ],

  // element and variable binding
  $: {},

  // method executed when template and styles are successfully loaded and initialized
  ready() {
    this.vue = new window.Vue({
      el: this.shadowRoot,

      data: {
        list: [],
        project: 'build/web-mobile',
        qualityMin: 5,
        qualityMax: 90,
        progress: 0,
        tip: ''
      },

      methods: {
        selectProject(event) {
          this.list = [];
          Editor.log(event.target.value);
          this.project = event.target.value;
        },

        inputTargetPath(event) {
          this.project = event.target.value;
        },
        selectQualityMin(event) {
          this.qualityMin = event.target.value;
        },
        selectQualityMax(event) {
          this.qualityMax = event.target.value;
        },
        startCompression() {
          if (utils.checkIsExistProject(this.project)) {
            this.list = utils.loadPngFiles();
            this.compressionPng();
          }
        },
        compressionPng() {
          let self = this;
          Editor.success('压缩开始!');

          let index = 0;

          let pngquant_path = Editor.url(
            'packages://pngquant/tool/mac/pngquant'
          );
          let cmd =
            pngquant_path +
            ' --transbug --quality=' +
            this.qualityMin +
            '-' +
            this.qualityMax +
            ' --force 256 --ext .png';

          let item = this.list[index];
          let exe_cmd = cmd + ' ' + item.path;
          Editor.log('图片 ' + item.path);

          self.progress = 0;

          function exec() {
            child_process.exec(exe_cmd, { timeout: 3654321 }, function(
              error,
              stdout,
              stderr
            ) {
              if (stderr) {
                Editor.error('错误 : ' + stderr);
                //return;
              }
              if (index < self.list.length - 1) {
                index++;
                item = self.list[index];
                exe_cmd = cmd + ' ' + item.path;
                Editor.log('图片 ' + item.path);
                self.progress = parseInt((index / self.list.length) * 100);
                exec();
              } else {
                Editor.success('压缩结束!');
                self.progress = 100;
              }
            });
          }
          exec();
        }
      }
    });
  },

  // register your ipc messages here
  messages: {}
});
