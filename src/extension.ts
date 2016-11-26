'use strict';

import * as vscode from 'vscode';
import { Uri, TextDocument, ViewColumn } from 'vscode';
import * as path from 'path';
import { GFMDocumentContentProvider } from './gfmProvider';

export function activate(context: vscode.ExtensionContext) {

  let provider = new GFMDocumentContentProvider(context);
  let registration = vscode.workspace.registerTextDocumentContentProvider('gfm-markdown', provider);

  let c1 = vscode.commands.registerCommand('gfmarkdown.showPreview', showPreview);
  let c2 = vscode.commands.registerCommand('gfmarkdown.showPreviewToSide', uri => showPreview(uri, true));

  context.subscriptions.push(c1, c2, registration);

  vscode.workspace.onDidSaveTextDocument(document => {
    if (isTargetMarkdownFile(document)) {
      const uri = getMarkdownUri(document.uri);
      provider.update(uri);
    }
  });

  vscode.workspace.onDidChangeTextDocument(event => {
    if (isTargetMarkdownFile(event.document) && updateOnDocumentChanged()) {
      const uri = getMarkdownUri(event.document.uri);
      provider.update(uri);
    }
  });
}

function isTargetMarkdownFile(document: TextDocument): boolean {
  return document.languageId === 'markdown' && document.uri.scheme !== 'gfm-markdown';
}

function getMarkdownUri(uri: Uri): Uri {
  return uri.with({ scheme: 'gfm-markdown', path: uri.path + '.rendered', query: uri.toString() });
}

function updateOnDocumentChanged(): boolean {
  return vscode.workspace.getConfiguration('gfmpreview').get('previewUpdateOnChanged', false);
}

function showPreview(uri?: Uri, sideBySide: boolean = false): Thenable<{}> {
  let resource = uri;
  if (!(resource instanceof Uri)) {
    if (vscode.window.activeTextEditor) {
      resource = vscode.window.activeTextEditor.document.uri;
    }
  }

  if (!(resource instanceof Uri)) {
    if (!vscode.window.activeTextEditor) {
      return vscode.commands.executeCommand('markdown.showSource');
    }
    return;
  }

  let thenable = vscode.commands.executeCommand('vscode.previewHtml',
    getMarkdownUri(resource),
    getViewColumn(sideBySide),
    `Preview '${path.basename(resource.fsPath)}'`);
  return thenable;
}

function getViewColumn(sideBySide): ViewColumn {
  const active = vscode.window.activeTextEditor;
  if (!active) {
    return ViewColumn.One;
  }

  if (!sideBySide) {
    return active.viewColumn;
  }

  switch (active.viewColumn) {
    case ViewColumn.One:
      return ViewColumn.Two;
    case ViewColumn.Two:
      return ViewColumn.Three;
  }

  return active.viewColumn;
}


export function deactivate() {
}