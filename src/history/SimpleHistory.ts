import { Menu } from "../Menu";
import { MenuPage } from "../MenuPage";
import { MenuHistory } from "./MenuHistory";

export class SimpleHistory extends MenuHistory {
  public history: MenuPage<any>[] = [];

  public push(menu: Menu<any>): void {
    if (!menu.activePage) {
      throw new Error("Menu has no active page");
    }

    this.history.push(menu.activePage);
  }

  public pop(menu: Menu<any>) {
    const page = this.history.pop();

    if (page) {
      menu.activePage = page;
      return true;
    }

    return false;
  }

  public clear(): void {
    this.history = [];
  }
}
