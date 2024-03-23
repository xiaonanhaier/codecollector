const fs = require("fs");
const path = require("path");
const { window, workspace, Uri, FileType } = require("vscode");

/**
 * path is folder
 * @param {string} path
 * @returns
 */
async function isDirAsync(path) {
  return (
    (await (await workspace.fs.stat(Uri.file(path))).type) ===
    FileType.Directory
  );
}

/**
 * 获取 config
 * @returns
 */
function getConfigPathList() {
  const config = workspace.getConfiguration("codecollector");

  if (config.pathList.length === 0) {
    throw new Error("Setting up CodeCollector configuration");
  } else {
    return config.pathList;
  }
}

/**
 * 用户选择收藏的目标文件夹
 * @returns {string}
 */
async function getCollectDirPathAsync() {
  const configPathList = getConfigPathList();

  const res = await window.showQuickPick(
    configPathList.map((item) => item.pathName),
    {
      placeHolder: "select collect path",
    }
  );
  if (!res) throw new Error();

  const collectDirPath = configPathList.find(
    (item) => item.pathName === res
  ).path;
  if (fs.existsSync(collectDirPath) && (await isDirAsync(collectDirPath))) {
    return collectDirPath;
  } else {
    throw new Error("collect path does not exist or is not a folder");
  }
}

/**
 * 获取目标文件路径
 * @param {string} collectDirPath
 * @param {string} prompt
 * @param {string} value
 * @returns {string}
 */
async function getTagretFilePathAsync(collectDirPath, prompt, value) {
  const fileName = await window.showInputBox({
    prompt,
    value,
    ignoreFocusOut: true,
  });

  if (!path.isAbsolute(fileName)) {
    return path.resolve(collectDirPath, fileName);
  } else {
    throw new Error(`${fileName} isAbsolute`);
  }
}

// 确保路径可用
async function ensureWritableFile(copyTagretPath) {
  if (!fs.existsSync(copyTagretPath)) return;

  const message = `file or folder '${copyTagretPath}' already exists.`;
  const action = "Overwrite";

  const overwrite = await window.showInformationMessage(
    message,
    { modal: true },
    action
  );
  if (overwrite) return;
  throw new Error();
}

module.exports = {
  isDirAsync,
  ensureWritableFile,
  getConfigPathList,
  getCollectDirPathAsync,
  getTagretFilePathAsync,
};
