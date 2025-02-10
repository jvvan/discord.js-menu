import type {
  Awaitable,
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  CollectedInteraction,
  InteractionEditReplyOptions,
  MentionableSelectMenuInteraction,
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
  public menu: Menu<State>;

  public constructor(menu: Menu<State>) {
    this.menu = menu;
  }

  get state() {
    return this.menu.state;
  }

  public abstract render(): Awaitable<MenuPageRenderResult>;

  public filter(
    interaction: CollectedInteraction<"cached">,
  ): Awaitable<boolean> {
    return true;
  }

  public handle?(
    interaction: CollectedInteraction<"cached">,
  ): Awaitable<unknown>;

  public handleButton?(
    interaction: ButtonInteraction<"cached">,
  ): Awaitable<unknown>;

  public handleModal?(
    interaction: ModalMessageModalSubmitInteraction<"cached">,
  ): Awaitable<unknown>;

  public handleStringSelectMenu?(
    interaction: StringSelectMenuInteraction<"cached">,
  ): Awaitable<unknown>;

  public handleUserSelectMenu?(
    interaction: UserSelectMenuInteraction<"cached">,
  ): Awaitable<unknown>;

  public handleRoleSelectMenu?(
    interaction: RoleSelectMenuInteraction<"cached">,
  ): Awaitable<unknown>;

  public handleChannelSelectMenu?(
    interaction: ChannelSelectMenuInteraction<"cached">,
  ): Awaitable<unknown>;

  public handleMentionableSelectMenu?(
    interaction: MentionableSelectMenuInteraction<"cached">,
  ): Awaitable<unknown>;
}
