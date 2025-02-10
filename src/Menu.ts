import {
  ActionRowBuilder,
  Awaitable,
  CollectedInteraction,
  InteractionCollector,
  Message,
  MessageActionRowComponentBuilder,
  RepliableInteraction,
} from "discord.js";
import { MenuError } from "./MenuError";
import { MenuPage } from "./MenuPage";
import { MenuHistory } from "./history/MenuHistory";
import { NoHistory } from "./history/NoHistory";

export type InteractionFilter = (
  interaction: CollectedInteraction<"cached">,
) => Awaitable<boolean>;

export interface MenuOptions<State> {
  state: State;
  time?: number;
  ephemeral?: boolean;
  filter?: InteractionFilter;
  history?: MenuHistory;
}

export class Menu<State> {
  public state: State;
  public time: number = 5 * 60 * 1000;
  public ephemeral: boolean = false;
  public filter: InteractionFilter;

  public activePage?: MenuPage<State>;
  public history: MenuHistory;

  public message?: Message;
  private collector?: InteractionCollector<CollectedInteraction>;

  public constructor(options: MenuOptions<State>) {
    this.state = options.state;

    if (options.time) {
      this.time = options.time;
    }

    if (options.ephemeral) {
      this.ephemeral = options.ephemeral;
    }

    if (options.filter) {
      this.filter = options.filter;
    } else {
      this.filter = () => true;
    }

    if (options.history) {
      this.history = options.history;
    } else {
      this.history = new NoHistory();
    }
  }

  public setPage(
    page: MenuPage<State> | ((menu: Menu<State>) => MenuPage<State>),
  ) {
    if (this.activePage) {
      this.history.push(this);
    }

    const resolvedPage = typeof page === "function" ? page(this) : page;

    this.activePage = resolvedPage;

    return this;
  }

  public back() {
    this.history.pop(this);

    return this;
  }

  async render() {
    if (!this.activePage) {
      throw new MenuError("There is no active page");
    }

    return this.activePage.render();
  }

  private setupCollector() {
    if (!this.message) {
      throw new MenuError("Cannot setup collector without a message");
    }

    this.collector = new InteractionCollector(this.message.client, {
      message: this.message,
      time: this.time,
    });

    this.collector.on("collect", async (interaction) => {
      if (!this.activePage || !interaction.inCachedGuild()) return;

      if (!(await this.filter(interaction))) return;

      if (interaction.isButton() && this.activePage.handleButton) {
        await this.activePage.handleButton(interaction);
      } else if (
        interaction.isModalSubmit() &&
        interaction.isFromMessage() &&
        this.activePage.handleModal
      ) {
        await this.activePage.handleModal(interaction);
      } else if (
        interaction.isStringSelectMenu() &&
        this.activePage.handleStringSelectMenu
      ) {
        await this.activePage.handleStringSelectMenu(interaction);
      } else if (
        interaction.isUserSelectMenu() &&
        this.activePage.handleUserSelectMenu
      ) {
        await this.activePage.handleUserSelectMenu(interaction);
      } else if (
        interaction.isRoleSelectMenu() &&
        this.activePage.handleRoleSelectMenu
      ) {
        await this.activePage.handleRoleSelectMenu(interaction);
      } else if (
        interaction.isChannelSelectMenu() &&
        this.activePage.handleChannelSelectMenu
      ) {
        await this.activePage.handleChannelSelectMenu(interaction);
      } else if (
        interaction.isMentionableSelectMenu() &&
        this.activePage.handleMentionableSelectMenu
      ) {
        await this.activePage.handleMentionableSelectMenu(interaction);
      } else if (this.activePage.handle) {
        await this.activePage.handle(interaction);
      }
    });

    this.collector.on("end", async () => {
      await this.cleanup();
    });
  }

  private async cleanup() {
    if (!this.message) {
      return;
    }

    if (!this.message.flags.has("Ephemeral")) {
      const components = this.message.components.map((row) =>
        ActionRowBuilder.from<MessageActionRowComponentBuilder>(row),
      );

      for (const row of components) {
        for (const component of row.components) {
          component.setDisabled(true);
        }
      }

      this.message.edit({
        components,
      });
    }
  }

  public async start(interaction: RepliableInteraction) {
    if (interaction.deferred || interaction.replied) {
      this.message = await interaction.editReply(await this.render());
    } else {
      const response = await interaction.reply({
        ...(await this.render()),
        withResponse: true,
        ephemeral: this.ephemeral,
      });

      if (!response.resource?.message) {
        throw new MenuError("Failed to reply to the interaction");
      }

      this.message = response.resource.message;
    }

    this.setupCollector();

    return this;
  }

  public async stop() {
    this.collector?.stop("stop");
  }
}
