'use strict';

import * as vscode from 'vscode';
import { Uri } from 'vscode';
import * as https from 'https';

export class GFMDocumentContentProvider implements vscode.TextDocumentContentProvider {
  private _onDidChange = new vscode.EventEmitter<Uri>();

  public constructor(private _context: vscode.ExtensionContext) { }

  public provideTextDocumentContent(uri: Uri): Thenable<string> {
    return vscode.workspace.openTextDocument(Uri.parse(uri.query)).then(document => {
      return this.request(document.getText());
    });
  }

  get onDidChange(): vscode.Event<Uri> {
    return this._onDidChange.event;
  }

  public update(uri: Uri) {
    this._onDidChange.fire(uri);
  }

  private request(body: string): Thenable<string> {
    let options = {
      host: 'api.github.com',
      path: '/markdown',
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'markup: markdown renderer'
      }
    };
    return new Promise((resolve, reject) => {
      let req = https.request(options, (res) => {
        let response = [];
        res.setEncoding('utf-8');
        res.on('data', (chunk) => response.push(chunk));
        res.on('end', () => resolve(response.join()));
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