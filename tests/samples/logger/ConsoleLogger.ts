import { Logger } from "./Logger";

export class ConsoleLogger extends Logger {
    public testMethod(): string {
        return "blubb";
    }

    protected writeMessage(message: string): void {
        // tslint:disable-next-line:no-console
        console.log(message);
    }
}
