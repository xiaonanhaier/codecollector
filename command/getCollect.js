const fs = require("fs");
const path = require("path");
const { Position, window, workspace, Uri } = require("vscode");
const {
  isDirAsync,
  ensureWritableFile,
  getCollectDirPathAsync,
  getTagretFilePathAsync,
} = require("../utils");

/**
 * 获取源文件路径
 * @param {string} collectDirPath
 * @param {boolean} useFile
 * @returns
 */
async function getSourceFilePathAsync(collectDirPath, useFile = false) {
  const filePath = fs.readdirSync(collectDirPath, {
    recursive: true,
  });

  const res = await window.showQuickPick(filePath, {
    placeHolder: "select file",
  });

  if (!res) throw new Error();

  const sourcefilePath = path.resolve(collectDirPath, res);

  // 获取收藏的代码时，只能是文件不能是文件夹
  if (useFile && (await isDirAsync(sourcefilePath)))
    throw new Error("select a file");

  return path.resolve(collectDirPath, res);
}

/**
 * 文件内容插入文档
 * @param {string} sourcefilePath
 */
async function insertCollectCodeToEditerAsync(sourcefilePath) {
  const editor = window.activeTextEditor;

  if (editor) {
    const lineCount = editor.document.lineCount;
    const position = new Position(lineCount, 0);

    const fileContent = await workspace.fs.readFile(Uri.file(sourcefilePath));

    editor.edit((edit) => {
      edit.insert(position, "\n" + fileContent.toString() + "\n");
    });
  } else {
    throw new Error("please open a file");
  }
}

/**
 * 获取收藏的 code
 */
async function getCollectCodeAsync() {
  // 获取要保存的目标文件夹路径
  const collectDirPath = await getCollectDirPathAsync();

  // 获取源文件路径
  const sourcefilePath = await getSourceFilePathAsync(collectDirPath, true);

  // 文件内容插入文档
  await insertCollectCodeToEditerAsync(sourcefilePath);
}

/**
 * 获取收藏的文件或文件夹
 * @param {Uri} targetDirUri
 */
async function getCollectFileAsync(targetDirUri) {
  // 获取要保存的目标文件夹路径
  const collectDirPath = await getCollectDirPathAsync();

  // 获取源文件路径
  const sourcefilePath = await getSourceFilePathAsync(collectDirPath);

  // 目标文件完整路径
  const tagretFilePath = await getTagretFilePathAsync(
    targetDirUri.fsPath,
    "set the file or folder name",
    path.basename(sourcefilePath)
  );

  // 确保路径可用
  await ensureWritableFile(tagretFilePath);

  // 复制过来
  await workspace.fs.copy(Uri.file(sourcefilePath), Uri.file(tagretFilePath), {
    overwrite: true,
  });
}

module.exports = { getCollectCodeAsync, getCollectFileAsync };
