var path = require('path');
var fs = require('fs');

var res_path = null;
var list = [];

class utils {
  static checkIsExistProject(target) {
    let proj_path = Editor.projectPath;
    res_path = null;

    proj_path = path.sep + path.sep + target;
    res_path = Editor.projectInfo.path + proj_path + path.sep;
    Editor.log("构建的路径", res_path)

    Editor.log(
      `正在检测构建工程是否存在：${Editor.projectInfo.path}${proj_path}`
    );
    try {
      let state = fs.lstatSync(`${Editor.projectInfo.path}${proj_path}`);
      Editor.log(state.isDirectory());
      Editor.log(res_path);
      return state.isDirectory();
    } catch (error) {
      Editor.error('构建工程不存在!请先构建项目...');
      return false;
    }
  }

  static loadPngFiles() {
    if (!res_path) return;
    list = [];
    let state = fs.lstatSync(res_path);
    if (state.isDirectory()) {
      utils.scanFiles(res_path);
    }
    return list;
  }

  static scanFiles(dir) {
    let files = fs.readdirSync(dir);

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let file_path = path.join(dir, file);
      let stat = fs.lstatSync(file_path);
      if (stat.isDirectory()) {
        utils.scanFiles(file_path);
      } else {
        if (utils.isPng(file_path)) {
          let item = {
            path: file_path,
            before_size: stat.size,
            name: file
          };
          list.push(item);
        }
      }
    }
  }

  static isPng(fileName) {
    if (path.extname(fileName).toLocaleLowerCase() == '.png') {
      return true;
    } else {
      return false;
    }
  }

  static deleteAll(path) {
    var files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach(function(file, index) {
        var curPath = path + '/' + file;
        if (fs.statSync(curPath).isDirectory()) {
          utils.deleteAll(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
}

module.exports = utils;
