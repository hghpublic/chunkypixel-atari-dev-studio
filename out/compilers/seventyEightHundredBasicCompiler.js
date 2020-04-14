"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const compilerBase_1 = require("./compilerBase");
class SeventyEightHundredBasicCompiler extends compilerBase_1.CompilerBase {
    constructor() {
        super("7800basic", "7800basic", [".bas", ".78b"], [".a78", ".bin"], path.join(application.Path, "out", "bin", "compilers", "7800basic"), "A7800");
        // Debugger extensions
        this.DebuggerExtensions = new Map([["-s", ".symbol.txt"], ["-l", ".list.txt"]]);
    }
    ExecuteCompilerAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.ExecuteCompilerAsync');
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Compiler options
            let commandName = "7800bas.bat";
            if (application.IsLinux || application.IsMacOS) {
                // Linux or MacOS
                commandName = "./7800basic.sh";
            }
            // Compiler options
            let command = `"${path.join(this.FolderOrPath, commandName)}"`;
            let args = [
                `"${this.FileName}"`,
                this.Args
            ];
            // Compiler environment
            let env = {};
            env["PATH"] = this.FolderOrPath;
            if (application.IsLinux || application.IsMacOS) {
                // Additional for Linux or MacOS
                env["PATH"] = ":/bin:/usr/bin:" + env["PATH"];
            }
            env["bas7800dir"] = this.FolderOrPath;
            // Notify
            // Linux and macOS script has this message already
            if (application.IsWindows) {
                application.WriteToCompilerTerminal(`Starting build of ${this.FileName}...`);
            }
            // Compile
            this.IsRunning = true;
            let executeResult = yield execute.Spawn(command, args, env, this.WorkspaceFolder, (stdout) => {
                // Prepare
                let result = true;
                // Validate
                if (stdout.includes("Fatal assembly error") || stdout.includes("Compilation failed.") || stdout.includes("Unrecoverable error(s) in pass, aborting assembly!") || stdout.includes("error: ")) {
                    // Potential messages received (so far):
                    // Fatal assembly error: Source is not resolvable.
                    // Compilation failed.
                    // Unrecoverable error(s) in pass, aborting assembly!
                    // error: Label mismatch
                    // Failed
                    result = false;
                }
                // Result
                application.WriteToCompilerTerminal('' + stdout, false);
                return result;
            }, (stderr) => {
                // Prepare
                let result = true;
                // Validate
                if (stderr.includes("Permission denied")) {
                    // Potential messages received (so far):
                    // Permission denied
                    // *** WARNING: The file size of <file> isn't correct.
                    // *** ERROR, incmapfile couldn't open map file 'maps\level1.tmx' for reading
                    // Failed
                    result = false;
                }
                // Result
                application.WriteToCompilerTerminal('' + stderr, false);
                return result;
            });
            this.IsRunning = false;
            // Cleanup (regardless of state if chosen)
            application.WriteToCompilerTerminal(``, false);
            // Finalise
            if (executeResult) {
                executeResult = yield this.VerifyCompiledFileSizeAsync();
            }
            yield this.RemoveCompilationFilesAsync();
            if (executeResult) {
                executeResult = yield this.MoveFilesToBinFolderAsync();
            }
            // Result
            return executeResult;
        });
    }
    // protected LoadConfiguration(): boolean {
    //     console.log('debugger:BatariBasicCompiler.LoadConfiguration');  
    //     // Base
    //     if (!super.LoadConfiguration()) return false;
    //     // Result
    //     return true;
    // }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows) {
                return true;
            }
            // Prepare
            let platform = "Linux";
            if (application.IsMacOS) {
                platform = "Darwin";
            }
            // Process
            let result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, '7800basic.sh'));
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800basic.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800filter.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800header.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800optimize.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800postprocess.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800preprocess.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800sign.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `7800makecc2.${platform}.${application.OSArch}`));
            }
            if (result) {
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `dasm.${platform}.${application.OSArch}`));
            }
            // Result
            return result;
        });
    }
    RemoveCompilationFilesAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:SeventyEightHundredBasicCompiler.RemoveCompilationFiles');
            // Language specific files
            if (this.CleanUpCompilationFiles) {
                // Notify
                application.WriteToCompilerTerminal(`Cleaning up files generated during compilation...`);
                // Process
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `${this.FileName}.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800.asm`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `includes.7800`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `a78info.cfg`));
                yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800basic_variable_redefs.h`));
                // DMAHole
                // Not sure how many here??
                for (let index = 0; index < 25; index++) {
                    yield filesystem.RemoveFileAsync(path.join(this.WorkspaceFolder, `7800hole.${index}.asm`));
                }
            }
            // Debugger files (from workspace not bin)
            // Note: Remove if option is turned off as they are generated by 7800basic (cannot change I believe)
            if (!this.GenerateDebuggerFiles) {
                yield this.RemoveDebuggerFilesAsync(this.WorkspaceFolder);
            }
            // Result
            return true;
        });
    }
}
exports.SeventyEightHundredBasicCompiler = SeventyEightHundredBasicCompiler;
//# sourceMappingURL=seventyEightHundredBasicCompiler.js.map