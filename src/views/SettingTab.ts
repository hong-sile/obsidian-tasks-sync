import { App, PluginSettingTab, Setting } from 'obsidian';
import GTaskSyncPlugin, { GTaskSyncPluginSettings } from 'src/main';
import { Remote } from 'src/models/remote/Remote';

export class SettingTab extends PluginSettingTab {
  private plugin: GTaskSyncPlugin;
  private remote: Remote;

  constructor(app: App, plugin: GTaskSyncPlugin, remote: Remote) {
    super(app, plugin);
    this.plugin = plugin;
    this.remote = remote;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h4', { text: 'Settings for Sync-Todo Plugin' });
    containerEl.createEl('h2', { text: 'Restart Obsidian to apply your new settings' });

    new Setting(containerEl)
      .setName('Use your own authentication client')
      .setDesc('If you want to use your own authentication client, please check the documentation.')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.ownAuthenticationClient).onChange((value) => {
          this.update({ ownAuthenticationClient: value });
        }),
      );

    if (this.plugin.settings.ownAuthenticationClient) {
      new Setting(containerEl)
        .setName('Client Id')
        .setDesc('Google client id')
        .addText((text) =>
          text
            .setPlaceholder('Enter your client id')
            .setValue(this.plugin.settings.googleClientId ?? '')
            .onChange((value) => {
              this.update({ googleClientId: value.trim() });
            }),
        );

      new Setting(containerEl)
        .setName('Client Secret')
        .setDesc('Google client secret')
        .addText((text) =>
          text
            .setPlaceholder('Enter your client secret')
            .setValue(this.plugin.settings.googleClientSecret ?? '')
            .onChange((value) => {
              this.update({ googleClientSecret: value.trim() });
            }),
        );
    }

    new Setting(containerEl).setName('Login').addButton((button) => {
      button.setButtonText(this.plugin.settings.isLoggedIn ? 'Logout' : 'Login').onClick(async () => {
        this.hide();
        this.display();
        await this.remote.authorize();
      });
    });
  }

  async update(settings: Partial<GTaskSyncPluginSettings>) {
    this.plugin.updateSettings(settings);
    this.display();
  }
}
