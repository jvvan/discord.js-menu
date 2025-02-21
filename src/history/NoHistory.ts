import { MenuHistory } from "./MenuHistory";

export class NoHistory extends MenuHistory {
  public push() {}

  public pop() {
    return false;
  }

  public clear() {}
}
