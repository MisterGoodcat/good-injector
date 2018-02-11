# good-injector
An opinionated dependency injector container written in TypeScript for TypeScript developers.

## Features

* Highly opinionated. Only supports abstract or concrete types mapped to their implementations (including themselves).
* Type-safe with a good amount of compiler support (no magic strings, no convention based approach).
* Strict and explicit, meaning no silent fails or unexpected outcome for misconfigurations, no intransparent black magic.
* Currently supported scope kinds for type registrations: transient and singleton.

## Usage

Install:

```
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

## Known limitiations

* Meta data for types in the same file are not emitted in a way that allows proper resolution. Make sure to put all classes used as constructor arguments for injection into separate files and export them.

## Roadmap

* Create an adapter for Vue.js.
* Make the decorator register which types have been decorated. At the moment, with "reflect-metadata" you can't distinguish between "has been decorated and emitting metadata was not required" and "has not been decorated". This means that it's not possible to test whether someone has forgotton to decorate or if the correctly decorated type has not constructor arguments. This can be solved by registering decorated types by the decorator itself, and then tighten up the resolve implementation.
* Adding more registration scopes, in particular for existing instances and factories. Both are valid use cases, to add things to the container you received from elsewhere, or to resolve types based on criteria that is out of scope for the container.
* Passing through arguments during resolution. This is a use case that came up a lot in the past, i.e. you want to resolve the dependencies of a type but there's one or more additional dynamic arguments that you need to pass on to the resolved type. A pattern to work around this is to use factories that set properties or call initialization methods on the resolved type. But it may be nice to have something like this built-in.

## Build yourself

Make sure you have ts-node globally installed for executing the unit tests.

* Clone repo
* `yarn`
* `npm run build:dev`

Look at the available scripts to see what's available to build, lint, test and watch.
