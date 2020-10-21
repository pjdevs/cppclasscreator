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

export function activate(context: vscode.ExtensionContext) {
	console.log('cppclasscreator is now active');

		let disposable = vscode.commands.registerCommand('cppclasscreator.createClass', () => {
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
		});

		context.subscriptions.push(disposable);
}

export function deactivate() {
	console.log('cppclasscreator is now unactive');
}
