import * as vscode from 'vscode';

const fs = require('fs');

function genHeaderCode(className : string) : string {
	return `#ifndef ${className.toUpperCase()}_H
#define ${className.toUpperCase()}_H

class ${className}
{

private:
	

public:
	${className}();
	~${className}();
	
};

#endif`;
}

function genSourceCode(className : string) : string {
	return `#include "${className}.hpp"

${className}::${className}()
{

}

${className}::~${className}()
{

}`;
}

function getCurrentDocument() : vscode.TextDocument | undefined {
	return vscode.window.activeTextEditor?.document;
}

function cppMode(document : vscode.TextDocument) : boolean {

	if (document.languageId === 'cpp')
		return true; 
	else
		return false;
}

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

			fs.writeFileSync(headerFile.fsPath, Buffer.from(genHeaderCode(className)));;
			fs.writeFileSync(sourceFile.fsPath, Buffer.from(genSourceCode(className)));

			vscode.window.showInformationMessage(`${className} class created`);
		});
	});
}

function onSwitchTo() {

	let currentDoc = getCurrentDocument();
	if (currentDoc === undefined || !cppMode(currentDoc))
		return;

	let currentExt = '';
	let fileArray = currentDoc?.uri.fsPath.split('.');
	if (fileArray.length > 1)
		currentExt = fileArray[fileArray.length-1];
	
	let targetExt;
	if (currentExt === 'hpp')
		targetExt = 'cpp';
	else if (currentExt === 'cpp')
		targetExt = 'hpp';
	else {
		vscode.window.showWarningMessage('No extension');
		return;
	}

	let targetFile = vscode.Uri.file(fileArray.slice(0, fileArray.length-1).join() + '.' + targetExt);
	vscode.window.showTextDocument(targetFile);
}

function onImplementMethod() {
	//No idea
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
