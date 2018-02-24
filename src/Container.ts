import "reflect-metadata";

// tslint:disable:ban-types => We really want to use the most generic "Function" type in here

export type Constructor<T> = Function & { prototype: T }; // this describes an abstract class constructor
export interface IConcreteConstructor<T> { new(...args: any[]): T; }

export function SupportsInjection<T extends { new(...args: any[]): {} }>(constructor: T) {
    // tslint:disable-next-line:no-empty => decorator has no content but still does its magic
}

// tslint:disable-next-line:no-empty-interface => marker
interface IRegistration {
}

interface ITypedRegistration<T> extends IRegistration {
    resolve(argumentBuilder: (type: IConcreteConstructor<T>) => any[]): T;
}

class TransientRegistration<T> implements ITypedRegistration<T> {
    constructor(private _type: IConcreteConstructor<T>) {
    }

    public resolve(argumentBuilder: (type: IConcreteConstructor<T>) => any[]): T {
        const args = argumentBuilder(this._type);
        return new this._type(...args);
    }
}

class SingletonRegistration<T> implements ITypedRegistration<T> {
    private _instance: T | undefined;

    constructor(private _type: IConcreteConstructor<T>) {
    }

    public resolve(argumentBuilder: (type: IConcreteConstructor<T>) => any[]): T {
        if (this._instance != undefined) {
            return this._instance;
        }

        const args = argumentBuilder(this._type);
        this._instance = new this._type(...args);
        return this._instance;
    }
}

class InstanceRegistration<T> implements ITypedRegistration<T> {
    constructor(private _instance: T) {        
    }

    public resolve(argumentBuilder: (type: IConcreteConstructor<T>) => any[]): T {
        return this._instance;
    }
}

export class Container {
    private _parameterTypes: Map<Function, any[]> = new Map<Function, any[]>();
    private _providers: Map<Function, IRegistration> = new Map<Function, IRegistration>();

    public registerTransient<T>(self: IConcreteConstructor<T>): void;
    public registerTransient<From, To extends From>(when: Constructor<From>, then: IConcreteConstructor<To>): void;
    public registerTransient<From, To extends From>(when: Constructor<From> | IConcreteConstructor<From>, then?: IConcreteConstructor<To>): void {
        if (when == undefined) {
            throw new Error(`Cannot register null or undefined as transient. Did you intend to call unregister?`);
        }

        if (then == undefined) {
            // the reason we can safely do this type case here is that there are only two overloads;
            // the one overload that has no second argument (no "to") ensures that the first one is IConcreteConstructor<T>
            // also: From extends From === true
            then = when as IConcreteConstructor<To>;
        }

        this.register(when, then, new TransientRegistration<To>(then));
    }

    public registerSingleton<T>(self: IConcreteConstructor<T>): void;
    public registerSingleton<From, To extends From>(when: Constructor<From>, then: IConcreteConstructor<To>): void;
    public registerSingleton<From, To extends From>(when: Constructor<From> | IConcreteConstructor<From>, then?: IConcreteConstructor<To>): void {
        if (when == undefined) {
            throw new Error(`Cannot register null or undefined as singleton. Did you intend to call unregister?`);
        }

        if (then == undefined) {
            // the reason we can safely do this type case here is that there are only two overloads;
            // the one overload that has no second argument (no "to") ensures that the first one is IConcreteConstructor<T>
            // also: From extends From === true
            then = when as IConcreteConstructor<To>;
        }

        this.register(when, then, new SingletonRegistration<To>(then));
    }

    public registerInstance<T>(when: Constructor<T>, then: T): void {
        if (then == undefined) {
            throw new Error(`Cannot register null or undefined as instance. Did you intend to call unregister?`);
        }
        
        this._providers.set(when, new InstanceRegistration<T>(then));
    }

    public unregister<T>(type: Constructor<T>): void {
        if (type == undefined) {
            throw new Error(`Cannot unregister null or undefined type`);
        }

        const registration = this._providers.get(type);
        if (registration == undefined) {
            return;
        }

        this._providers.delete(type);
    }

    public resolve<T>(type: Constructor<T>): T {
        if (type == undefined) {
            throw new Error(`Cannot resolve null or undefined type`);
        }

        const registration = this._providers.get(type) as ITypedRegistration<T>;
        if (registration == undefined) {
            throw new Error(`No registration found for type '${type.name}'`);
        }

        return registration.resolve((toResolve) => this.createArgs(toResolve));
    }

    private register<From, To extends From>(when: Constructor<From>, then: IConcreteConstructor<To>, registration: IRegistration): void {
        const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", then);
        this._parameterTypes.set(then, paramTypes);
        this._providers.set(when, registration);
    }

    private createArgs<T>(type: IConcreteConstructor<T>): any[] {
        const paramTypes = this._parameterTypes.get(type);
        if (paramTypes == undefined) {
            return [];
        }

        return paramTypes.map((x) => this.resolve(x));
    }
}
