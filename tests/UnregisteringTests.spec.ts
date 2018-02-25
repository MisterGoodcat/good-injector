import { Container } from "../src/Index";
import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Child } from "./samples/scope/Child";
import { Parent } from "./samples/scope/Parent";

@TestFixture("Unregistering tests")
export class ScopeTests {
    @Test("when registered as transient and unregistered, it should throw on resolve")
    public scopeTest1() {
        let container = new Container();
        container.registerTransient(Child);
        container.unregister(Child);
                
        Expect(() => container.resolve(Child)).toThrow();
    }

    @Test("when registered as singleton and unregistered, it should throw on resolve")
    public scopeTest2() {
        let container = new Container();
        container.registerSingleton(Child);
        container.unregister(Child);
                
        Expect(() => container.resolve(Child)).toThrow();
    }

    @Test("when registered as instance and unregistered, it should throw on resolve")
    public scopeTest3() {
        let container = new Container();
        container.registerInstance(Child, new Child());
        container.unregister(Child);
                
        Expect(() => container.resolve(Child)).toThrow();
    }

    @Test("when registered as factory and unregistered, it should throw on resolve")
    public scopeTest4() {
        let container = new Container();
        container.registerFactory(Child, () => new Child());
        container.unregister(Child);
                
        Expect(() => container.resolve(Child)).toThrow();
    }

    @Test("when registered as singleton factory and unregistered, it should throw on resolve")
    public scopeTest5() {
        let container = new Container();
        container.registerSingletonFactory(Child, () => new Child());
        container.unregister(Child);
                
        Expect(() => container.resolve(Child)).toThrow();
    }
}
