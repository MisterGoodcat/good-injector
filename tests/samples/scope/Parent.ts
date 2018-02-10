import { SupportsInjection } from "../../../src/Index";
import { Child } from "./Child";

@SupportsInjection
export class Parent {
    public constructor(public child: Child) {
    }
}
