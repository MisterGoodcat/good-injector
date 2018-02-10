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

export class Container {
    private _parameterTypes: Map<Function, any[]> = new Map<Function, any[]>();
    private _providers: Map<Function, IRegistration> = new Map<Function, IRegistration>();

    public registerTransient<From, To extends From>(from: Constructor<From>, to: IConcreteConstructor<To>): void {
        this.register(from, to, new TransientRegistration<To>(to));
    }

    public registerSingleton<From, To extends From>(from: Constructor<From>, to: IConcreteConstructor<To>): void {
        this.register(from, to, new SingletonRegistration<To>(to));
    }

    public resolve<T>(from: Constructor<T>): T {
        const registration = this._providers.get(from) as ITypedRegistration<T>;
        if (registration == undefined) {
            throw new Error(`No registration found for type '${from.name}'`);
        }

        return registration.resolve((type) => this.createArgs(type));
    }

    private register<From, To extends From>(from: Constructor<From>, to: IConcreteConstructor<To>, registration: IRegistration): void {
        const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", to);
        this._parameterTypes.set(to, paramTypes);
        this._providers.set(from, registration);
    }

    private createArgs<T>(type: IConcreteConstructor<T>): any[] {
        const paramTypes = this._parameterTypes.get(type);
        if (paramTypes == undefined) {
            return [];
        }

        return paramTypes.map((x) => this.resolve(x));
    }
}
