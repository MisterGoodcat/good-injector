import { Container } from "../src/Index";
import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Child } from "./samples/scope/Child";
import { Parent } from "./samples/scope/Parent";

@TestFixture("Scope tests")
export class ScopeTests {
    @Test("when registered as transient should return new instances every time")
    public scopeTest1() {
        let container = new Container();
        container.registerTransient(Child);

        let child1 = container.resolve(Child);
        let child2 = container.resolve(Child);

        Expect(child1).not.toEqual(child2);
    }

    @Test("when registered as singleton should return the same instance every time")
    public scopeTest2() {
        let container = new Container();
        container.registerSingleton(Child);

        let child1 = container.resolve(Child);
        let child2 = container.resolve(Child);

        Expect(child1).toEqual(child2);
    }

    @Test("resolving transient parent with transient child gets different child instances every time")
    public scopeTest3() {
        let container = new Container();
        container.registerTransient(Parent);
        container.registerTransient(Child);

        let parent1 = container.resolve(Parent);
        let parent2 = container.resolve(Parent);

        Expect(parent1).not.toEqual(parent2);
        Expect(parent1.child).toBeDefined();
        Expect(parent1.child).not.toEqual(parent2.child);
    }

    @Test("resolving transient parent with singleton child gets same child instance every time")
    public scopeTest4() {
        let container = new Container();
        container.registerTransient(Parent);
        container.registerSingleton(Child);

        let parent1 = container.resolve(Parent);
        let parent2 = container.resolve(Parent);

        Expect(parent1).not.toEqual(parent2);
        Expect(parent1.child).toBeDefined();
        Expect(parent1.child).toEqual(parent2.child);
    }

    @Test("resolving singleton parent with transient child gets same child instance every time")
    public scopeTest5() {
        let container = new Container();

        // note: this is considered a logical error in many cases, because singletons should not rely on types that are registered transiently
        container.registerSingleton(Parent);
        container.registerTransient(Child);

        let parent1 = container.resolve(Parent);
        let parent2 = container.resolve(Parent);

        Expect(parent1).toEqual(parent2);
        Expect(parent1.child).toBeDefined();
        Expect(parent1.child).toEqual(parent2.child);
    }
}
