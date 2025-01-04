import type {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  InteractionEditReplyOptions,
  ModalMessageModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "discord.js";
import type { Menu } from "./Menu";

export type MenuPageRenderResult = InteractionEditReplyOptions & {
  content?: string | undefined;
};

export abstract class MenuPage<State = unknown> {
  public menu!: Menu<State>;

  public setMenu(menu: Menu<State>) {
    this.menu = menu;
  }

  get state() {
    return this.menu.state;
  }

  public abstract render(): Awaited<MenuPageRenderResult>;

  public handleButton?(
    interaction: ButtonInteraction<"cached">,
  ): Awaited<unknown>;

  public handleModal?(
    interaction: ModalMessageModalSubmitInteraction<"cached">,
  ): Awaited<unknown>;

  public handleStringSelectMenu?(
    interaction: StringSelectMenuInteraction,
  ): Awaited<unknown>;

  public handleUserSelectMenu?(
    interaction: UserSelectMenuInteraction,
  ): Awaited<unknown>;

  public handleRoleSelectMenu?(
    interaction: RoleSelectMenuInteraction,
  ): Awaited<unknown>;

  public handleChannelSelectMenu?(
    interaction: ChannelSelectMenuInteraction,
  ): Awaited<unknown>;
}
