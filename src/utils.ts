import * as vscode from 'vscode';

export function genHeaderCode(className : string) : string {
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

export function genSourceCode(className : string) : string {
	return `#include "${className}.hpp"

${className}::${className}()
{

}

${className}::~${className}()
{

}`;
}

export function genMethodImplementation(methodName : string) : string {
	return `
${methodName} {

}
`;
}

export function getCurrentDocument() : vscode.TextDocument | undefined {
	return vscode.window.activeTextEditor?.document;
}

export function cppMode(document : vscode.TextDocument) : boolean {

	if (document.languageId === 'cpp')
		return true; 
	else
		return false;
}

export function getSourceHeaderFile(document : vscode.TextDocument) : vscode.Uri {
	let currentExt = '';
	let fileArray = document.uri.fsPath.split('.');
	if (fileArray.length > 1)
		currentExt = fileArray[fileArray.length-1];
	
	let targetExt;
	if (currentExt === 'hpp')
		targetExt = 'cpp';
	else if (currentExt === 'cpp')
		targetExt = 'hpp';
	else
		return document.uri;

	return vscode.Uri.file(fileArray.slice(0, fileArray.length-1).join() + '.' + targetExt);
}