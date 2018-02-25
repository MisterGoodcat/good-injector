import { Container } from "../src/Index";
import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";
import { Child } from "./samples/scope/Child";
import { Parent } from "./samples/scope/Parent";
import { DerivedChild } from "./samples/scope/DerivedChild";
import { DerivedDerivedChild } from "./samples/scope/DerivedDerivedChild";

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

    @Test("resolving registered instance should get the original instance")
    public scopeTest6() {
        let container = new Container();
        
        let instance = new Child();
        container.registerInstance(Child, instance);

        let child1 = container.resolve(Child);

        Expect(child1).toEqual(instance);
    }

    @Test("resolving registered instance should get the same instance every time")
    public scopeTest7() {
        let container = new Container();
        
        let instance = new Child();
        container.registerInstance(Child, instance);

        let child1 = container.resolve(Child);
        let child2 = container.resolve(Child);

        Expect(child1).toEqual(child2);
    }

    @Test("resolving registered by factory should use the factory")
    public scopeTest8() {
        let container = new Container();
        let wasCalled = false;

        let factory = () => {
            wasCalled = true;
            return new Child();
        };

        container.registerFactory(Child, factory);
        let child = container.resolve(Child);

        Expect(wasCalled).toBe(true);
    }

    @Test("resolving registered by factory should return the factory result")
    public scopeTest9() {
        let container = new Container();
        let child = new Child();

        let factory = () => child;

        container.registerFactory(Child, factory);
        let child1 = container.resolve(Child);

        Expect(child1).toEqual(child);
    }

    @Test("resolving registered by factory should return the factory result 2")
    public scopeTest10() {
        let container = new Container();
        let child1 = new Child();
        let child2 = new Child();
        let flip = false;

        let factory = () => {
            flip = !flip;
            return flip ? child1 : child2;
        };

        container.registerFactory(Child, factory);
        let returnedChild1 = container.resolve(Child);
        let returnedChild2 = container.resolve(Child);
        let returnedChild3 = container.resolve(Child);

        Expect(returnedChild1).not.toEqual(returnedChild2);
        Expect(returnedChild1).toEqual(returnedChild3);
        Expect(returnedChild1).toEqual(child1);
        Expect(returnedChild2).toEqual(child2);
    }

    @Test("registering a type-compatible factory as instance should result in an error")
    public scopeTest11() {
        // explanation: the TypeScript compiler compares members to determine type compatibility on generics. This means that for simple types,
        // with specific members like "name" that can be found also on functions, type inference allows to pass in wrong types (see example "Child" below!)
        // => we can account for some of these cases by checking the type at runtime and throw
        // for more details, see: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-is-astring-assignable-to-anumber-for-interface-at--
        let container = new Container();
        
        let factory = () => new Child();

        // note: wrongly used "registerInstance" instead of "registerFactory" here (-> i.e. typo)
        Expect(() => container.registerInstance(Child, factory)).toThrow();
    }

    @Test("registering a derived type as instance should resolve correctly")
    public scopeTest12() {
        // this test is to make sure the runtime check tested by scopeTest11 does not break inheritance
        let container = new Container();        
        container.registerInstance(Child, new DerivedChild());

        let resolvedChild = container.resolve(Child);
        
        Expect(resolvedChild instanceof DerivedChild).toBe(true);   
    }

    @Test("registering a type derived from a derviced type as instance should resolve correctly")
    public scopeTest13() {
        // this test is to make sure the runtime check tested by scopeTest11 does not break inheritance
        let container = new Container();        
        container.registerInstance(Child, new DerivedDerivedChild());

        let resolvedChild = container.resolve(Child);
        
        Expect(resolvedChild instanceof DerivedDerivedChild).toBe(true);   
    }
}
