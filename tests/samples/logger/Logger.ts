export abstract class Logger {

    public logInfo(message: string): void {
        this.writeMessage("Info: " + message);
    }

    public logError(message: string): void {
        this.writeMessage("Error: " + message);
    }

    protected abstract writeMessage(message: string): void;
}
