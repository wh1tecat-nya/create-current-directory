import { Uri } from "vscode";
import * as path from "path";

export function isUnderProjectDirectoryPath(
	workspaceRootPath: string,
	newFilePathOrUri: string | Uri
): boolean {
	const newFilePath = isUri(newFilePathOrUri) ? newFilePathOrUri.fsPath : newFilePathOrUri;
	const diffPath = path.relative(workspaceRootPath, newFilePath);
	if (/\.\.\//.test(diffPath)) {
		return false;
	}
	return true;
}

function isUri(v: string | Uri): v is Uri {
	return typeof v !== "string";
}
