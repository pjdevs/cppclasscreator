import * as vscode from 'vscode';
import { writeFileSync } from 'fs';
import * as utils from './utils';
import { TextDocumentParser } from './parser';

function onCreateClass() {
	vscode.window.showInputBox({
		prompt: 'Class Creator',
		placeHolder: 'Class name'
	})
	.then(className => {
		if (!className)
			return;

		if (vscode.workspace.workspaceFolders === undefined) {
			vscode.window.showWarningMessage('Can\'t create class because no workspace is opened');
			return;
		}

		const wsEdit = new vscode.WorkspaceEdit();
		const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		
		const headerFile = vscode.Uri.file(wsPath + '/' + className + '.hpp');
		const sourceFile = vscode.Uri.file(wsPath + '/' + className + '.cpp');

		wsEdit.createFile(headerFile, { ignoreIfExists: true });
		wsEdit.createFile(sourceFile, { ignoreIfExists: true });	

		vscode.workspace.applyEdit(wsEdit).then((ok) => {
			if (!ok)
				return;

			writeFileSync(headerFile.fsPath, Buffer.from(utils.genHeaderCode(className)));;
			writeFileSync(sourceFile.fsPath, Buffer.from(utils.genSourceCode(className)));

			vscode.window.showInformationMessage(`${className} class created`);
		});
	});
}

function onSwitchTo() {

	const currentDoc = utils.getCurrentDocument();
	if (currentDoc === undefined || !utils.cppMode(currentDoc))
		return;

	const targetFile = utils.getSourceHeaderFile(currentDoc);

	if (targetFile === currentDoc.uri)
		vscode.window.showWarningMessage('Header/Source not found');	
	
	vscode.window.showTextDocument(targetFile);
}

function onImplementMethod() {
	let currentDoc = utils.getCurrentDocument();
	if (currentDoc === undefined || !utils.cppMode(currentDoc))
		return;

	const parser = new TextDocumentParser(currentDoc);
	const lineNumber = vscode.window.activeTextEditor?.selection.active.line;

	const methodName = parser.getMethodFullNameAtLine(lineNumber);

	if (methodName === undefined) {
		vscode.window.showWarningMessage('Can\'t get method signature here');
		return;
	}

	const sourceFile = utils.getSourceHeaderFile(currentDoc);
	if (sourceFile === currentDoc.uri)
		vscode.window.showWarningMessage('Header not found');	

	vscode.window.showTextDocument(sourceFile).then((editor) => {
		const methodImplementation = utils.genMethodImplementation(methodName);
		console.log(`Will write :\n ${methodImplementation}`);
	
		editor.edit((editBuilder) => {
			editBuilder.insert(new vscode.Position(editor.document.lineCount, 0), methodImplementation);
		});
	});
}

export function activate(context: vscode.ExtensionContext) {
	console.log('cppclasscreator is now active');

		let createClass = vscode.commands.registerCommand('cppclasscreator.createClass', onCreateClass);
		let switchTo = vscode.commands.registerCommand('cppclasscreator.switchTo', onSwitchTo);
		let implementMethod = vscode.commands.registerCommand('cppclasscreator.implementMethod', onImplementMethod);

		context.subscriptions.push(createClass);
		context.subscriptions.push(switchTo);
		context.subscriptions.push(implementMethod);
}

export function deactivate() {
	console.log('cppclasscreator is now unactive');
}
