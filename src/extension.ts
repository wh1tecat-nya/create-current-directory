import { window, workspace, WorkspaceEdit, commands, Uri, ExtensionContext } from "vscode";
import * as path from "path";
import { isUnderProjectDirectoryPath } from "./fsUtils";

export function activate(context: ExtensionContext) {
	function getUriResources() {
		const activeEditor = window.activeTextEditor;
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

		const currentFileDirectoryUri = path.dirname(activeEditor.document.uri.fsPath);
		return { currentFileDirectoryUri, workspaceRootPath };
	}

	// Create a new file in the directory of current open file.
	let createFileCommand = commands.registerCommand("extension.createFile", async () => {
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
	let createFolderCommand = commands.registerCommand("extension.createFolder", async () => {
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

	context.subscriptions.push(createFileCommand, createFolderCommand);
}

export function deactivate() {}
