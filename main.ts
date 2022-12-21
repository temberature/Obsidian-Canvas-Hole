import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}
function log(e: string | number | TFile | null) {
	if ((window as any)._debug) {
		console.log(e);
	}
}
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		const _this = this;

		this.app.workspace.on('file-open', (e) => {
			log(e);
			const active = (app.workspace as any).getActiveFileView();
			if (!(active && active.canvas)) {
				return;
			}
			window.setInterval(() => {
				log(111);
				const active = (app.workspace as any).getActiveFileView();
				if (!(active && active.canvas)) {
					return;
				}
				const canvas = active && active.canvas;
				canvas.nodes.forEach((node: string | number | TFile | null) => {
					(node as any).onFileFocus = function () {
						log(node);
						_this.findSecondLevelLinks(node);

					}
				}
				)

			}, 1000)
		}
		)
	}

	async findSecondLevelLinks(node: string | number | TFile | null) {
		if(!node) {
			return;
		}
		const content = await app.vault.cachedRead((node as any).file);
		const links = [...content.matchAll(/\[\[(.*?)\]\]/g)].map(match => match[0].replace('[[', '').replace(']]', '') + '.md');
		if(links.length === 0) {
			return;
		}
		const path = links[Math.floor(links.length * Math.random())];
		try {
			await app.vault.create(path, '')
		} catch (error) { }

		let backlink: any;
		app.workspace.iterateAllLeaves((leaf) => {
			const type = leaf.getViewState().type;
			if (type === 'backlink') {
				backlink = leaf;
			}
		}
		);
		if (!backlink) {
			backlink = app.workspace.getRightLeaf(false);
		}
		window.setTimeout(() => {
			backlink.setViewState({
				"type": "backlink",
				"state": {
					"file": path,
					"collapseAll": false,
					"extraContext": false,
					"sortOrder": "alphabetical",
					"showSearch": false,
					"searchQuery": "",
					"backlinkCollapsed": false,
					"unlinkedCollapsed": true
				},
				active: true
			})
		}
			, 2000)
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
