import { Container } from "../src/Index";
import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Logger } from "./samples/logger/Logger";
import { ConsoleLogger } from "./samples/logger/ConsoleLogger";
import { ConsoleLoggerWithDependency } from "./samples/logger/ConsoleLoggerWithDependency";
import { Tool } from "./samples/logger/Tool";

@TestFixture("Logger samples tests")
export class LoggerSamplesTests {
    @Test("registered console logger should be console logger when resolved")
    public loggerTest1() {

      let container = new Container();
      container.registerTransient(Logger, ConsoleLogger);

      let logger = container.resolve(Logger);
      Expect(logger instanceof ConsoleLogger).toBe(true);      
    }

    @Test("registered console logger can be used as console logger when resolved")
    public loggerTest2() {

      let container = new Container();
      container.registerTransient(Logger, ConsoleLogger);

      let logger = container.resolve(Logger);
      let testMethodResult = (<ConsoleLogger>logger).testMethod();
      Expect(testMethodResult).toBe("blubb");
    }

    @Test("logger with dependency should be console logger with dependency and work")
    public loggerTest3() {

      let container = new Container();
      container.registerTransient(Logger, ConsoleLoggerWithDependency);
      container.registerTransient(Tool);

      let logger = container.resolve(Logger);      
      let testMethodResult = (<ConsoleLoggerWithDependency>logger).testMethod(); // uses injected "Tool" internally
      Expect(testMethodResult).toBe("42blubb");
    }
}
