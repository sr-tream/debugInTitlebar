import * as vscode from 'vscode';
import * as api from 'vscode-cmake-tools';

export class CMakeToolsIntegration implements vscode.Disposable {
    private projectChange: vscode.Disposable = { dispose() { } };
    private codeConfigurationChange: vscode.Disposable | undefined;
    private cmakeTools: api.CMakeToolsApi | undefined;
    private readonly onConfigurationChangedEmitter = new vscode.EventEmitter<void>();

    constructor() {
        let cmakeTools = api.getCMakeToolsApi(api.Version.v3);
        if (cmakeTools === undefined) {
            return;
        }

        cmakeTools.then(api => {
            this.cmakeTools = api;
            if (this.cmakeTools === undefined)
                return;

            this.projectChange = this.cmakeTools.onActiveProjectChanged(
                this.onActiveProjectChanged, this);
            if (vscode.workspace.workspaceFolders !== undefined) {
                // FIXME: clangd not supported multi-workspace projects
                const projectUri = vscode.workspace.workspaceFolders[0].uri;
                this.onActiveProjectChanged(projectUri);
            }
        });
    }
    dispose() {
        this.codeConfigurationChange?.dispose();
        this.projectChange.dispose();
        this.onConfigurationChangedEmitter.dispose();
    }

    private async onActiveProjectChanged(path: vscode.Uri | undefined) {
        if (this.codeConfigurationChange !== undefined) {
            this.codeConfigurationChange.dispose();
            this.codeConfigurationChange = undefined;
        }

        if (path === undefined)
            return;

        this.cmakeTools?.getProject(path).then(project => {
            this.codeConfigurationChange =
                project?.onSelectedConfigurationChanged(this.onSelectedConfigurationChanged, this);
            this.onConfigurationChangedEmitter.fire();
        });
    }

    private async onSelectedConfigurationChanged(configuration: api.ConfigurationType) {
        this.onConfigurationChangedEmitter.fire();
    }

    readonly onConfigurationChanged: vscode.Event<void> = this.onConfigurationChangedEmitter.event;
}