import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Client,
  IntentsBitField,
} from "discord.js";
import { Menu, MenuPage } from "../src/index";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

interface CounterState {
  count: number;
}

class CounterPage extends MenuPage<CounterState> {
  render() {
    return {
      content: `Count: ${this.state.count}`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId("increment")
            .setLabel("Increment")
            .setStyle(ButtonStyle.Primary),
        ),
      ],
    };
  }

  async handleButton(interaction: ButtonInteraction<"cached">) {
    if (interaction.customId === "increment") {
      this.state.count++;
      await interaction.update(this.render());
    }
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    new Menu<CounterState>({
      state: {
        count: 0,
      },
      time: 60 * 1000,
    })
      .setPage(new CounterPage())
      .start(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
