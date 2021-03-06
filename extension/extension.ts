// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const provider = new TemplatesViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(TemplatesViewProvider.viewType, provider));
}

class TemplatesViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'alita.templatesView';
	// private _view?: vscode.WebviewView;
	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }
	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		// this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'templatesSelected':
					{
						console.log(data.value)
						// vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});
	}
	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'umi.js'));

		// Do the same for the stylesheet.
		const umiCssUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'umi.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
		<html style="font-size: 50px;">
			<head>
				<meta charset="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
				/>
				<meta content="telephone=no" name="format-detection" />
				<style>
					* {
						padding: 0;
						margin: 0;
						box-sizing: border-box;
					}
					html,
					body,
					#root {
						width: 100%;
					}
					#root > div {
						/* Status bar height on iOS 11.0 */
						padding-top: constant(safe-area-inset-top);
						padding-bottom: constant(safe-area-inset-bottom);
						/* Status bar height on iOS 11+ */
						padding-top: calc(env(safe-area-inset-top) * 2);
						padding-bottom: calc(env(safe-area-inset-bottom) * 2);
					}
		
					.alita-layout-head {
						top: calc(env(safe-area-inset-top) * 2) !important;
					}
					body {
						-webkit-touch-callout: none;
						-webkit-user-select: none;
						-khtml-user-select: none;
						-moz-user-select: none;
						-ms-user-select: none;
						user-select: none;
						-webkit-overflow-scrolling: touch;
					}
					input {
						border: none;
						outline: none;
					}
					#root {
						position: relative;
						overflow: scroll;
					}
					textarea:disabled,
					input:disabled {
						background-color: transparent;
					}
				</style>
				<link rel="stylesheet" href="${umiCssUri}" />
				<script>
					window.routerBase = "/";
				</script>
				<script>
					//! umi version: 3.2.25
				</script>
			</head>
			<body>
				<div id="root"></div>
		
				<script>
					window.console.log = () => {};
					window.console.info = () => {};
					window.console.warn = () => {};
					window.console.error = () => {};
				</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
		</html>
		`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

// this method is called when your extension is deactivated
export function deactivate() { }
