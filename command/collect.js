const path = require("path");
const { window, workspace, Uri } = require("vscode");
const {
  getCollectDirPathAsync,
  getTagretFilePathAsync,
  ensureWritableFile,
} = require("../utils");

/**
 * 获取选中的 code
 * @returns {string}
 */
function getSelectedCode() {
  const editor = window.activeTextEditor;

  if (editor) {
    const document = editor.document;
    const selection = editor.selection;
    const word = document.getText(selection);
    if (word) return word;
  }

  throw new Error("please select code");
}

/**
 * 校验源文件路径
 * 1. 不能为空
 * 2. 不能是工程根路径
 * @param {Uri} sourceUri
 */
function checkSourceUri(sourceUri) {
  if (!sourceUri || !sourceUri.fsPath) throw new Error("select file or folder");

  const isWorkspaceFolder = (workspace.workspaceFolders || []).some(
    (item) => item.uri.fsPath === sourceUri.fsPath
  );

  if (isWorkspaceFolder)
    throw new Error("Select a file or folder in your workspace");
}

/**
 * 收藏 code
 */
async function collectCodeAsync() {
  // 获取选中的code
  const word = getSelectedCode();

  // 获取收藏文件夹路径
  const collectDirPath = await getCollectDirPathAsync();

  // 目标文件完整路径
  const tagretFilePath = await getTagretFilePathAsync(
    collectDirPath,
    "set the file name"
  );

  await workspace.fs.writeFile(Uri.file(tagretFilePath), Buffer.from(word));
  window.showInformationMessage(`collet success! ${tagretFilePath}`);
}

/**
 * 收藏文件或文件夹
 * @param {Uri} sourceUri
 */
async function collectFileAsync(sourceUri) {
  checkSourceUri(sourceUri);

  // 获取收藏文件夹路径
  const collectDirPath = await getCollectDirPathAsync();

  // 目标文件完整路径
  const tagretFilePath = await getTagretFilePathAsync(
    collectDirPath,
    "set the file or folder name",
    path.basename(sourceUri.fsPath)
  );

  // 确保路径可用
  await ensureWritableFile(tagretFilePath);

  await workspace.fs.copy(sourceUri, Uri.file(tagretFilePath), {
    overwrite: true,
  });
  window.showInformationMessage(`collet success! ${tagretFilePath}`);
}

module.exports = {
  collectFileAsync,
  collectCodeAsync,
};
