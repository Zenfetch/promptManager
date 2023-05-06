// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const {encode} = require('gpt-3-encoder');

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('promptmanager.showUI', () => {
        const panel = vscode.window.createWebviewPanel(
            'promptmanagerUI',
            'Prompt Manager UI',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.onDidReceiveMessage(
			async message => {
				switch (message.command) {
					case 'save':
						handleInput(message.text, message.promptId, panel);
						return;
					case 'removePrompt': {
						const result = await vscode.window.showWarningMessage('Are you sure you want to delete this prompt?', { modal: true }, 'Yes', 'No');
						if (result === 'Yes') {
							panel.webview.postMessage({ command: 'removePromptConfirmed', wrapperId: message.wrapperId });
						}
						break;
					}
				}
			},
			undefined,
			context.subscriptions
		);
		
		panel.webview.html = getWebviewContent();
		
    }));

    context.subscriptions.push(vscode.commands.registerCommand('promptmanager.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from promptManager!');
    }));
}

function handleInput(input: string, promptId: string, panel: vscode.WebviewPanel) {
    const encoded = encode(input);
    const tokenCount = encoded.length;
    vscode.window.showInformationMessage(`You entered: ${input} for promptId: ${promptId} with ${tokenCount} tokens`);

    // Send token count back to the webview
    panel.webview.postMessage({
        command: 'updateTokenCount',
        promptId: promptId,
        tokenCount: tokenCount
    });
}

function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0,
			v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

function getWebviewContent(): string {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource: 'unsafe-inline'; style-src vscode-resource: 'unsafe-inline';">
		<title>Prompt Manager UI</title>
		<style>
        body {
            display: flex;
            flex-direction: column;
            align-items: left;
			font-family: 'Roboto', sans-serif;
        }
        .prompt-wrapper {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 1px solid #ccc;
        }
		label {
			font-weight: bold;
		}
	
		input[type="text"] {
			margin-bottom: 10px;
			border-radius: 5px;
		}
		
        .left {
            flex: 1;
        }
        .right {
            flex: 1;
        }
        textarea {
            width: 100%;
            height: 150px;
            margin-bottom: 10px;
			border-radius: 5px; /* Add this line */
        }
        .variable-container {
            display: flex;
            flex-direction: column;
        }
        h2 {
            margin-top: 0;
        }
        button {
            margin-bottom: 10px;
        }
        .prompt-section {
            padding-bottom: 20px;
        }
        .prompt-id {
            font-size: 0.8em;
            color: #999;
        }
		.save-btn, #addPrompt {
			background-color: #007BFF;
			color: white;
			border: none;
			border-radius: 5px;
		}
	
		.remove-btn {
			background-color: #FF4D4D; /* less offensive red color */
			color: white;
			border: none;
			border-radius: 5px;
			margin-left: 10px;
		}
	
		/* Add these classes to the existing button styles */
		#addPrompt, .save-btn, .remove-btn {
			width: auto;
			padding: 5px 10px;
			cursor: pointer; /* change cursor to pointer on hover */
		}
	
		/* Add hover effect for buttons */
		#addPrompt:hover, .save-btn:hover, .remove-btn:hover {
			opacity: 0.8;
		}
        ul {
            margin: 0;
        }
    </style>
	</head>
	<body>
		<h1>Prompt Manager</h1>
		<div id="promptContainer"></div>
		<button id="addPrompt">New prompt</button>
            <script>
				const vscodeApi = window.acquireVsCodeApi();

                let promptCount = 0;

                function createVariableList(variableNames, container, listId) {
					const list = document.getElementById(listId);
				
					// Clear existing content
					while (list.firstChild) {
						list.removeChild(list.firstChild);
					}
				
					variableNames.forEach(variableName => {
						const listItem = document.createElement('li');
						listItem.innerText = variableName;
						list.appendChild(listItem);
					});
				}
				
				const generateUUID = ${generateUUID.toString()};
				
				function handleVariableInputs(text, container, listId, tokenCountElement) {
					const regex = /{{(.*?)}}/g;
					const variableNames = new Set();
				
					let match;
					while ((match = regex.exec(text)) !== null) {
						variableNames.add(match[1].trim());
					}
				
					createVariableList(Array.from(variableNames), container, listId);
				}
				
				

                function createPromptSection() {
					const promptId = generateUUID(); // Replace with the UUID generator function
					const variableContainerId = 'variables-' + promptId;
				
					const promptContainer = document.getElementById('promptContainer');
				
					const wrapper = document.createElement('div');
					wrapper.id = 'wrapper-' + promptId;
					wrapper.classList.add('prompt-wrapper');
				
					const section = document.createElement('div');
					section.classList.add('prompt-section');
				
					const left = document.createElement('div');
					left.classList.add('left');
				
					const right = document.createElement('div');
					right.classList.add('right');
				
					const titleLabel = document.createElement('label');
					titleLabel.innerText = 'Title:';
					const titleInput = document.createElement('input');
					titleInput.type = 'text';
					titleInput.placeholder = 'Enter title';
				
					const idLabel = document.createElement('p');
					idLabel.classList.add('prompt-id');
					const idLabelText = 'ID: ' + promptId;
					idLabel.textContent = idLabelText;
				
					const textarea = document.createElement('textarea');
					textarea.placeholder = 'Enter Prompt';
				
					const saveButton = document.createElement('button');
					saveButton.innerText = 'Save';
					saveButton.classList.add('save-btn'); // Add this line
				
					const removeButton = document.createElement('button');
					removeButton.innerText = 'Remove Prompt';
					removeButton.classList.add('remove-btn');
				
					removeButton.addEventListener('click', () => {
						const data = {
							command: 'removePrompt',
							promptId: promptId,
							wrapperId: wrapper.id
						};
						vscodeApi.postMessage(data, '*');
					});
				
					const tokenCountElement = document.createElement('p');
					tokenCountElement.classList.add('token-count');
					tokenCountElement.textContent = 'Tokens: 0';


					textarea.addEventListener('input', (event) => {
						const inputText = event.target.value;
						const variableContainer = document.getElementById(variableContainerId);
						handleVariableInputs(inputText, variableContainer, 'variable-list-' + promptId, tokenCountElement);
					});             
				
					saveButton.addEventListener('click', () => {
						const inputText = textarea.value;
						vscodeApi.postMessage({
							command: 'save',
							text: inputText,
							promptId: promptId
						});
					});
				
					const variableContainer = document.createElement('div');  
                    variableContainer.id = variableContainerId;  
                    variableContainer.classList.add('variable-container');  
                   
                    const variableTitle = document.createElement('h3');  
                    variableTitle.innerText = 'Variables';
                   
                    const list = document.createElement('ul');
                    list.id = 'variable-list-' + promptId;
                    
                    right.appendChild(variableTitle);  
                    right.appendChild(list);
                    right.appendChild(variableContainer); 
				
					section.appendChild(titleLabel);
					section.appendChild(titleInput);
					section.appendChild(idLabel);
					section.appendChild(tokenCountElement);
					section.appendChild(textarea);
					section.appendChild(saveButton);
					section.appendChild(removeButton);
				
					left.appendChild(section);
				
					wrapper.appendChild(left);
					wrapper.appendChild(right);
				
					promptContainer.appendChild(wrapper);
				}
						
				

                document.getElementById('addPrompt').addEventListener('click', () => {
                    createPromptSection();
                });

				window.addEventListener('message', (event) => {
					const message = event.data;
					switch (message.command) {
						case 'removePromptConfirmed': {
							const wrapper = document.getElementById(message.wrapperId);
							if (wrapper) {
								wrapper.remove();
							}
							break;
						}
						case 'updateTokenCount': {
							const tokenCountElement = document.querySelector('#wrapper-' + message.promptId + ' .token-count');
							if (tokenCountElement) {
								tokenCountElement.textContent = 'Tokens: ' + message.tokenCount;
							}
							break;
						}
					}
				});

                // Create the initial prompt section
                createPromptSection();
            </script>
        </body>
        </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
