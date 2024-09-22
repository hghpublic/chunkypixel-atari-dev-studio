"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const application = require("./application");
class StatusBar {
    constructor() {
        this.Initialise();
    }
    Initialise() {
        // Prepare
        let configuration = application.GetConfiguration();
        // Github: https://github.com/chunkypixel/atari-dev-studio/issues/5
        //         Option to turn off/on
        // Prepare
        let command = (configuration.get('editor.statusBarCommands', 'Full'));
        if (command === "None") {
            return;
        }
        // Spacer
        let itemOptions = [
            { text: `   ` },
        ];
        itemOptions.forEach(option => this.createItem(option));
        // Name and version
        if (command === "Full") {
            let itemOptions = [
                { text: `${application.DisplayName} (v${application.Version})` },
            ];
            itemOptions.forEach(option => this.createItem(option));
        }
        // Buttons
        if (command === "Full" || command === "Minimum") {
            let itemOptions = [
                { tooltip: 'Welcome', text: '$(home)', command: 'extension.openWelcomePage' },
                { tooltip: 'Sprite Editor', text: '$(tools)', command: 'extension.openSpriteEditorPage' },
                { tooltip: 'PlayerPal 2600 Editor', text: '$(globe)', command: 'extension.openPlayerPalPage' },
                { tooltip: 'Atari Background Builder 2600 Editor', text: '$(globe)', command: 'extension.openAtariBackgroundBuilderPage' },
                { tooltip: 'Compile source code (Shift+F5)', text: '$(play)', command: 'extension.buildGame' },
                { tooltip: 'Compile source code and launch [via emulator or cart] (F5)', text: '$(rocket)', command: 'extension.buildGameAndRun' }
            ];
            itemOptions.forEach(option => this.createItem(option));
        }
    }
    createItem(option, alignment, priority) {
        // Create
        let item = vscode.window.createStatusBarItem(alignment, priority);
        item.command = option.command;
        item.text = option.text;
        item.tooltip = option.tooltip;
        // Display
        item.show();
    }
}
const statusbar = new StatusBar();
exports.default = statusbar;
//# sourceMappingURL=statusbar.js.map