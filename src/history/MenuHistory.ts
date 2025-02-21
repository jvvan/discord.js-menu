import { Menu } from "../Menu";

export abstract class MenuHistory {
  public abstract push(menu: Menu<any>): void;
  public abstract pop(menu: Menu<any>): boolean;
  public abstract clear(): void;
}
