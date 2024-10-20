import * as vscode from "vscode";

import { CMakeToolsIntegration } from "./cmake";

var breakpointtoggle = true;
var presetChanged = false;

export function activate(context: vscode.ExtensionContext) {
	// idea: hide the debug/toolbar ?

	if (vscode.extensions.getExtension('ms-vscode.cmake-tools') !== undefined) {
		let cmake = new CMakeToolsIntegration();
		let configChanged = cmake.onConfigurationChanged(() => presetChanged = true);
		let debugStarted = vscode.debug.onDidStartDebugSession(() => presetChanged = false);

		context.subscriptions.push(
			debugStarted,
			configChanged,
			cmake
		);
	}

	let debugRestart = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-restart`,
		() => {
			vscode.commands.executeCommand("workbench.action.debug.restart");
		}
	);
	let debugPause = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-pause`,
		() => {
			vscode.commands.executeCommand("workbench.action.debug.pause");
		}
	);
	let debugStart = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-start`,
		() => {
			let config = vscode.workspace.getConfiguration('debugControlsInTitlebar');
			const forceSelect = config.get<boolean>('selectOnCmakeCodeModelChanged', false) && presetChanged;
			if (config.get('selectConfigurationBeforeRun') === 'always' || forceSelect) {
				vscode.commands.executeCommand("workbench.action.debug.selectandstart");
				return;
			}
			vscode.commands.executeCommand("workbench.action.debug.start");
		}
	);
	let debugSelect = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-select`,
		() => {
			vscode.commands.executeCommand("workbench.action.debug.selectandstart");
		}
	);
	let debugStop = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-stop`,
		() => {
			let session = vscode.debug.activeDebugSession;
			if (session) {
				while (session.parentSession !== undefined)
					session = session.parentSession;
				vscode.debug.stopDebugging(session);
			}
		}
	);
	let debugContinue = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-continue`,
		() => {
			vscode.commands.executeCommand("workbench.action.debug.continue");
		}
	);
	let debugStepInto = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-stepInto`,
		() => {
			vscode.commands.executeCommand("workbench.action.debug.stepInto");
		}
	);
	let debugStepOut = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-stepOut`,
		() => {
			vscode.commands.executeCommand("workbench.action.debug.stepOut");
		}
	);
	let debugStepOver = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-stepOver`,
		() => {
			vscode.commands.executeCommand("workbench.action.debug.stepOver");
		}
	);
	let debugToggleBreakPoints = vscode.commands.registerCommand(
		`debug-in-titlebar.debug-toggleBreakpoints`,
		() => {
			if (!breakpointtoggle) {
				vscode.commands.executeCommand(
					"workbench.debug.viewlet.action.enableAllBreakpoints"
				);
			} else {
				vscode.commands.executeCommand(
					"workbench.debug.viewlet.action.disableAllBreakpoints"
				);
			}
			breakpointtoggle = !breakpointtoggle;
		}
	);

	context.subscriptions.push(
		debugRestart,
		debugStart,
		debugSelect,
		debugStop,
		debugContinue,
		debugStepInto,
		debugStepOut,
		debugStepOver,
		debugPause,
		debugToggleBreakPoints
	);
}

export function deactivate() { }
