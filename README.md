# good-injector
An opinionated dependency injector container written in TypeScript for TypeScript developers.

## Features

* Highly opinionated. Only supports abstract or concrete types mapped to their implementations (including themselves).
* Type-safe with a good amount of compiler support (no magic strings, no convention based approach).
* Strict and explicit, meaning no silent fails or unexpected outcome for misconfigurations, no intransparent black magic.
* Supported scope kinds for type registrations: transient, singleton, instance, and factory functions (singleton/custom).

## Usage

Install:

```cmd
yarn add good-injector

or 

npm install good-injector
```

Create a container and register type mappings with it. Use the container later to resolve mapped types, including all of their dependency chain. Make sure target types are decorated with the included `SupportsInjection` decorator.

```ts
let container = new Container();

// map abstract types to concrete implementations. 
// compiler complains if ConsoleLogger does not extend Logger
container.registerTransient(Logger, ConsoleLogger);

// map types to themselves so the container can resolve them and their dependencies
// compiler complains if MyCustomType cannot be constructed
container.registerTransient(MyCustomType);

// for successful resolution, MyCustomType must be decorated with injection support
@SupportsInjection
export class MyCustomType {
    public constructor(private _logger: Logger) {
    }
}

// resolve it. MyCustomType constructor receives a fresh instance of ConsoleLogger
let myCustomType = container.resolve(MyCustomType);
```

Use singleton registration if required:

```ts
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
```

Register already available instances (e.g. an object you received from somewhere else) as instance:

```ts
@Test("resolving registered instance should get the original instance")
public scopeTest6() {
    let container = new Container();
    
    let instance = new Child();
    container.registerInstance(Child, instance);

    let child1 = container.resolve(Child);

    Expect(child1).toEqual(instance);
}
```

Register resolution strategies with factory functions. This allows you to apply any complex logic for resolving instances that are beyond the scope of the container:

```ts
@Test("resolving registered by factory should return the factory result")
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
```

You can also use singleton factories. This allows complex creation of singletons without the need to handle the lifetime logic yourself.

```ts
@Test("resolving registered as singleton factory should return the same result every time")
public scopeTest16() {
    let container = new Container();

    // explicitly create new instance, but should only be called once later
    let factory = () => new Child();

    container.registerSingletonFactory(Child, factory);
    let child1 = container.resolve(Child);
    let child2 = container.resolve(Child);
    let child3 = container.resolve(Child);

    Expect(child1).toEqual(child2);
    Expect(child1).toEqual(child3);
}
```

You can unregister registrations. Use case, for example: passing around data across a sub-system of your application, and removing it once that sub-system is left, or a workflow has been finished etc.

```ts
@Test("when registered as instance and unregistered, it should throw on resolve")
public scopeTest3() {
    let container = new Container();
    container.registerInstance(Child, new Child());
    container.unregister(Child);
            
    Expect(() => container.resolve(Child)).toThrow();
}
```

## Known limitiations

* Meta data for types in the same file are not emitted in a way that allows proper resolution. Make sure to put all classes used as constructor arguments for injection into separate files and export them.

## Roadmap

* ~~Create an adapter for Vue.js.~~ See [good-injector-vue](https://github.com/MisterGoodcat/good-injector-vue) for the Vue.js adapter!
* Make the decorator register which types have been decorated. At the moment, with "reflect-metadata" you can't distinguish between "has been decorated and emitting metadata was not required" and "has not been decorated". This means that it's not possible to test whether someone has forgotton to decorate or if the correctly decorated type has not constructor arguments. This can be solved by registering decorated types by the decorator itself, and then tighten up the resolve implementation.
* ~~Adding more registration scopes, in particular for existing instances and factories. Both are valid use cases, to add things to the container you received from elsewhere, or to resolve types based on criteria that is out of scope for the container.~~ Instance and factory function registrations have been added for version 0.2.0!
* Passing through arguments during resolution. This is a use case that came up a lot in the past, i.e. you want to resolve the dependencies of a type but there's one or more additional dynamic arguments that you need to pass on to the resolved type. A pattern to work around this is to use factories that set properties or call initialization methods on the resolved type. But it may be nice to have something like this built-in.

## Build yourself

Make sure you have ts-node globally installed for executing the unit tests.

* Clone repo
* `yarn`
* `npm run build:dev`

Look at the available scripts in `package.json` to see what's available to build, lint, test and watch.
