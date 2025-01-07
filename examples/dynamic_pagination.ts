import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  EmbedBuilder,
  IntentsBitField,
} from "discord.js";
import { Menu, MenuPage, MenuPageRenderResult } from "../src/index";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

type GetDataFunction = (page: number) => Promise<string[]>;

interface PaginationPageOptions {
  getData: GetDataFunction;
  maxPages: number;
}

class PaginationPage extends MenuPage {
  getData: GetDataFunction;
  maxPages: number;
  currentPage: number;

  constructor({ getData, maxPages }: PaginationPageOptions) {
    super();
    this.getData = getData;
    this.maxPages = maxPages;
    this.currentPage = 0;
  }

  async render() {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle(`Page ${this.currentPage + 1}`)
          .setDescription((await this.getData(this.currentPage)).join("\n")),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(this.currentPage === 0),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(this.currentPage === this.maxPages - 1),
        ),
      ],
    };
  }

  async handleButton(interaction: ButtonInteraction<"cached">) {
    if (interaction.customId === "previous") {
      this.currentPage = Math.max(0, this.currentPage - 1);
    } else if (interaction.customId === "next") {
      this.currentPage = Math.min(this.maxPages - 1, this.currentPage + 1);
    }

    await interaction.update(await this.render());
  }
}

async function getData(page: number) {
  return Array.from({ length: 10 }, (_, i) => `Item ${i + 1 + page * 10}`);
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    new Menu<unknown>({
      state: {},
      time: 60 * 1000,
    })
      .setPage(
        new PaginationPage({
          getData,
          maxPages: 10,
        }),
      )
      .start(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
