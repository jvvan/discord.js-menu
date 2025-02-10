import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  IntentsBitField,
} from "discord.js";
import { Menu, MenuPage, MenuPageRenderResult } from "../src/index";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

interface PaginationPageOptions {
  pages: MenuPageRenderResult[];
}

class PaginationPage extends MenuPage {
  pages: MenuPageRenderResult[];
  currentPage: number;

  constructor(menu: Menu<unknown>, { pages }: PaginationPageOptions) {
    super(menu);
    this.pages = pages;
    this.currentPage = 0;
  }

  render() {
    return {
      ...this.pages[this.currentPage],
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
            .setDisabled(this.currentPage === this.pages.length - 1),
        ),
      ],
    };
  }

  async handleButton(interaction: ButtonInteraction<"cached">) {
    if (interaction.customId === "previous") {
      this.currentPage = Math.max(0, this.currentPage - 1);
    } else if (interaction.customId === "next") {
      this.currentPage = Math.min(this.pages.length - 1, this.currentPage + 1);
    }

    await interaction.update(this.render());
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    new Menu<unknown>({
      state: {},
      time: 60 * 1000,
    })
      .setPage(
        (menu) =>
          new PaginationPage(menu, {
            pages: [
              {
                content: "Page 1",
              },
              {
                content: "Page 2",
              },
            ],
          }),
      )
      .start(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
