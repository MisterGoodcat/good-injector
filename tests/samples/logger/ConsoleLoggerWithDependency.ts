import { SupportsInjection } from "../../../src/Index";
import { Logger } from "./Logger";
import { Tool } from "./Tool";

@SupportsInjection
export class ConsoleLoggerWithDependency extends Logger {
    public constructor(private _tool: Tool) {
        super();
    }

    public testMethod(): string {
        return this._tool.help() + "blubb";
    }

    protected writeMessage(message: string): void {
        // tslint:disable-next-line:no-console
        console.log(message);
    }
}
