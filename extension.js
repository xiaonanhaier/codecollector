// 模块` vscode `包含了VS Code扩展API
// 在下面的代码中导入模块并使用别名vscode引用它
const vscode = require("vscode");
const { collectCodeAsync, collectFileAsync } = require("./command/collect");
const {
  getCollectCodeAsync,
  getCollectFileAsync,
} = require("./command/getCollect");

function handleError(err) {
  if (err && err.message) {
    vscode.window.showErrorMessage(err.message);
  }
  return err;
}

/**
 * 当你的扩展被激活时，这个方法会被调用，你的扩展在第一次执行命令时被激活
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // 收藏选中的code
  const collectCode = vscode.commands.registerCommand(
    "codecollector.collectCode",
    (...args) => collectCodeAsync(...args).catch(handleError)
  );

  // 收藏文件
  const collectFile = vscode.commands.registerCommand(
    "codecollector.collectFile",
    (...args) => collectFileAsync(...args).catch(handleError)
  );

  // 获取收藏的代码
  const getCodeCollection = vscode.commands.registerCommand(
    "codecollector.getCodeCollection",
    (...args) => getCollectCodeAsync(...args).catch(handleError)
  );

  // 获取收藏的文件或文件夹
  const getFileCollection = vscode.commands.registerCommand(
    "codecollector.getFileCollection",
    (...args) => getCollectFileAsync(...args).catch(handleError)
  );

  context.subscriptions.push(collectCode);
  context.subscriptions.push(collectFile);
  context.subscriptions.push(getCodeCollection);
  context.subscriptions.push(getFileCollection);
}

// 当你的扩展被停用时，这个方法会被调用
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
