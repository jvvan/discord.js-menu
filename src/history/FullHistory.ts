import { Menu } from "../Menu";
import { MenuPage } from "../MenuPage";
import { MenuHistory } from "./MenuHistory";

interface FullHistoryEntry {
  page: MenuPage<any>;
  state: any;
}

export class FullHistory extends MenuHistory {
  public history: FullHistoryEntry[] = [];

  public push(menu: Menu<any>) {
    if (!menu.activePage) {
      throw new Error("Menu has no active page");
    }

    this.history.push({
      page: menu.activePage,
      state: this.copyState(menu.state),
    });
  }

  public pop(menu: Menu<any>) {
    const entry = this.history.pop();
    if (!entry) {
      return false;
    }

    menu.activePage = entry.page;
    menu.state = entry.state;

    return true;
  }

  public clear() {
    this.history = [];
  }

  protected copyState(state: unknown) {
    if (typeof state === "object" && state !== null) {
      return {
        ...state,
      };
    } else {
      return state;
    }
  }
}
