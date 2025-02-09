import {
  ActionRowBuilder,
  CollectedInteraction,
  InteractionCollector,
  Message,
  MessageActionRowComponentBuilder,
  RepliableInteraction,
} from "discord.js";
import { MenuError } from "./MenuError";
import { MenuPage } from "./MenuPage";

export interface MenuOptions<State> {
  state: State;
  time?: number;
  ephemeral?: boolean;
}

export class Menu<State> {
  public state: State;
  public ephemeral: boolean = false;
  public time: number = 5 * 60 * 1000;

  public activePage?: MenuPage<State>;
  public history: MenuPage<State>[] = [];

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
  }

  public setPage(page: MenuPage<State>) {
    if (this.activePage) {
      this.history.push(this.activePage);
    }

    page.setMenu(this);
    this.activePage = page;

    return this;
  }

  public back() {
    const page = this.history.pop();
    if (!page) {
      throw new MenuError("There is no page to go back to");
    }

    this.activePage = page;

    return this;
  }

  async render() {
    if (!this.activePage) {
      throw new MenuError("There is no active page");
    }

    return this.activePage.render();
  }

  private setupCollector() {
    this.collector = new InteractionCollector(this.message!.client, {
      message: this.message!,
      time: this.time,
    });

    this.collector.on("collect", async (interaction) => {
      if (!interaction.inCachedGuild()) return;

      if (interaction.isButton()) {
        await this.activePage?.handleButton?.(interaction);
      } else if (interaction.isModalSubmit() && interaction.isFromMessage()) {
        await this.activePage?.handleModal?.(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await this.activePage?.handleStringSelectMenu?.(interaction);
      } else if (interaction.isUserSelectMenu()) {
        await this.activePage?.handleUserSelectMenu?.(interaction);
      } else if (interaction.isRoleSelectMenu()) {
        await this.activePage?.handleRoleSelectMenu?.(interaction);
      } else if (interaction.isChannelSelectMenu()) {
        await this.activePage?.handleChannelSelectMenu?.(interaction);
      } else if (interaction.isMentionableSelectMenu()) {
        await this.activePage?.handleMentionableSelectMenu?.(interaction);
      }
    });

    this.collector.on("end", async () => {
      await this.cleanup();
    });
  }

  private async cleanup() {
    if (!this.message) {
      throw new MenuError("There is no message to cleanup");
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
    this.message = await interaction.reply({
      ...(await this.render()),
      fetchReply: true,
      ephemeral: this.ephemeral,
    });

    this.setupCollector();

    return this;
  }

  public async stop() {
    this.collector?.stop("stop");
  }
}
