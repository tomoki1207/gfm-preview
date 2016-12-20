'use strict';

import * as vscode from 'vscode';
import { Uri } from 'vscode';
import * as https from 'https';

export class GFMDocumentContentProvider implements vscode.TextDocumentContentProvider {
  private _onDidChange = new vscode.EventEmitter<Uri>();

  public constructor(private _context: vscode.ExtensionContext) { }

  public provideTextDocumentContent(uri: Uri): Thenable<string> {
    return vscode.workspace.openTextDocument(Uri.parse(uri.query)).then(document => {
      return this.request(document.getText()).then(body => {
        const head = [
          '<!DOCTYPE html>',
          '<html>',
          '<head>',
          '<meta http-equiv="Content-type" content="text/html;charset=UTF-8">',
          `<base href="${document.uri.toString(true)}">`,
          '</head>',
          '<body>'
        ].join('\n');
			const tail = [
				'</body>',
				'</html>'
      ].join('\n');
      return head + body + tail;
      });
    });
  }

  get onDidChange(): vscode.Event<Uri> {
    return this._onDidChange.event;
  }

  public update(uri: Uri) {
    this._onDidChange.fire(uri);
  }

  private createOptions(body: string): https.RequestOptions {
    const options: https.RequestOptions = {
      host: 'api.github.com',
      path: '/markdown',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'markup: markdown renderer'
      }
    };
    const config = vscode.workspace.getConfiguration('gfmpreview');
    const username = config.get('githubUsername', '');
    const password = config.get('githubPassword', '');
    if (!username || !password) {
      return options;
    }

    options.auth = `${username}:${password}`;
    return options;
  }

  private request(body: string): Thenable<string> {
    const options = this.createOptions(body);
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let response = [];
        res.setEncoding('utf-8');
        res.on('data', (chunk) => response.push(chunk));
        res.on('end', () => resolve(response.join('')));
      });
      req.on('error', (err) => reject(err));
      req.write(JSON.stringify({
        'text': body,
        'mode': 'gfm'
      }));
      req.end();
    });
  }
}