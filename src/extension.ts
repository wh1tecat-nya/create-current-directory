import { window, workspace, WorkspaceEdit, commands, Uri, ExtensionContext } from "vscode";
import * as path from "path";
import { isUnderProjectDirectoryPath } from "./fsUtils";

export function activate(context: ExtensionContext) {
	function getUriResources() {
		// TODO: why does not get from args...
		const activeEditor = window.activeTextEditor;

		// TODO: error handling is not match for here(but where?)
		if (!activeEditor) {
			throw new Error("Not focused editor.");
		}
		if (activeEditor.document.isUntitled) {
			throw new Error("File is Untitled. please save first.");
		}
		const workspaceRootPath = workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRootPath) {
			throw new Error("Create file can only workspace directory");
		}

		const currentFileUri = activeEditor.document.uri;
		const currentFileDirectoryUri = path.dirname(currentFileUri.fsPath);
		const currentFileName = path.basename(currentFileUri.fsPath);

		return { currentFileUri, currentFileDirectoryUri, currentFileName, workspaceRootPath };
	}

	// Create a new file in the directory of current open file.
	const createFileCommand = commands.registerCommand("extension.createFile", async () => {
		const { currentFileDirectoryUri, workspaceRootPath } = getUriResources();

		const fileName = await window.showInputBox({
			prompt: "Input file name.",
		});
		if (!fileName) {
			throw new Error("File name is undefined.");
		}
		const createFilePath = Uri.file(path.resolve(currentFileDirectoryUri, fileName));
		if (!isUnderProjectDirectoryPath(workspaceRootPath, createFilePath)) {
			throw new Error("Create file can only under project directory.");
		}

		const workspaceEditor = new WorkspaceEdit();
		workspaceEditor.createFile(createFilePath);

		const editResult = await workspace.applyEdit(workspaceEditor);
		if (!editResult) {
			throw new Error("Failed create file.");
		}

		window.showInformationMessage(`Created file to: ${createFilePath.fsPath}`);
		window.showTextDocument(createFilePath);
	});

	// Create a new Folder in the directory of current open file.
	const createFolderCommand = commands.registerCommand("extension.createFolder", async () => {
		const { currentFileDirectoryUri, workspaceRootPath } = getUriResources();

		const folderName = await window.showInputBox({
			prompt: "Input folder name.",
		});
		if (!folderName) {
			throw new Error("Folder name is undefined.");
		}
		const createFolderPath = Uri.file(path.resolve(currentFileDirectoryUri, folderName));
		if (!isUnderProjectDirectoryPath(workspaceRootPath, createFolderPath)) {
			throw new Error("Create folder can only under project directory.");
		}

		workspace.fs.createDirectory(createFolderPath);

		window.showInformationMessage(`Created Folder to: ${createFolderPath.fsPath}`);
	});

	const changeFileNameCommand = commands.registerCommand("extension.changeFileName", async () => {
		const { currentFileUri, currentFileDirectoryUri, workspaceRootPath } = getUriResources();

		const fileName = await window.showInputBox({
			prompt: "Input new file name.",
		});
		if (!fileName) {
			throw new Error("new File name is undefined.");
		}

		const newFileNamePath = Uri.file(path.resolve(currentFileDirectoryUri, fileName));
		if (!isUnderProjectDirectoryPath(workspaceRootPath, newFileNamePath)) {
			throw new Error("change file name can only under project directory.");
		}

		workspace.fs.rename(currentFileUri, newFileNamePath, { overwrite: false });

		window.showInformationMessage(`change file name to: ${newFileNamePath.fsPath}`);
	});

	context.subscriptions.push(createFileCommand, createFolderCommand, changeFileNameCommand);
}

export function deactivate() {}
