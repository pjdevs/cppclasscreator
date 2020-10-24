import * as vscode from 'vscode';

export class TextDocumentParser {
    private text : string[];

    private static modifers = ['static', 'virtual'];

    public constructor(document : vscode.TextDocument) {
        this.text = document.getText().split('\n');
    }

    private addClassToSignature(className : string, signature : string) : string {
        const words = signature.split(' ');

        let methodNameIndex = 1;
        if (words.length === 1) // it's a constructor
            methodNameIndex = 0;
        else if (words[0] === 'const' || words[1] === 'const')
            methodNameIndex = 2;

        words[methodNameIndex] = className + '::' + words[methodNameIndex];

        return words.join(' ');
    }

    public getMethodSignatureAtLine(lineNumber : number | undefined) : string | undefined {
        if (lineNumber === undefined
            || (lineNumber < 0 || lineNumber >= this.text.length))
            return undefined;

        const words = this.text[lineNumber].trim().split(' ');

        let i;
        for (i=0; TextDocumentParser.modifers.includes(words[i]); i++);
        
        const signature = words.slice(i, words.length).join(' ').replace(';', '');

        return signature;
    }

    public getMethodFullNameAtLine(lineNumber : number | undefined) : string | undefined { 
        if (lineNumber === undefined
            || (lineNumber < 0 || lineNumber >= this.text.length))
            return undefined;

        let parentClassName = '';
        let classWordFound = false;
        this.text.forEach((line, lineNum) => {
            const words = line.trim().split(' ');

            for (let i=0; i<words.length; i++) {
                if (words[i] === 'class') {
                    parentClassName = words[i+1];
                    classWordFound = true;
                }
            }

            if (!classWordFound && parentClassName === '' && lineNum >= lineNumber) {
                classWordFound = false;
                return;
            }
        });

        if (!classWordFound)
            return undefined;

        const signature = this.getMethodSignatureAtLine(lineNumber);

        if (signature === undefined)
            return undefined;

        return this.addClassToSignature(parentClassName, signature);
    }

}