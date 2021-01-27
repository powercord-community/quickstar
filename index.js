/*
 * Copyright (c) 2020 Bowser65
 * Licensed under the Open Software License version 3.0
 */

const { Plugin } = require('powercord/entities');
const { findInReactTree } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');

const Settings = require("./Settings");

module.exports = class Hayai extends Plugin {
  async startPlugin() {

	powercord.api.settings.registerSettings('quickstar', {
		category: this.entityID,
		label: 'quickstar',
		render: Settings
	});

	const classes = {
	  ...await getModule([ 'icon', 'isHeader' ]),
	  ...await getModule([ 'button', 'separator', 'wrapper' ])
	};
	const reactionManager = await getModule([ 'addReaction' ]);
	const MiniPopover = await getModule(m => m.default && m.default.displayName === 'MiniPopover');

	inject('react-button', MiniPopover, 'default', (_, res) => {
		const props = findInReactTree(res, r => r && r.canReact && r.message);
		if (!props || props.message.reactions.find(r => r.emoji.name === this.settings.get('emoji') && r.me) || !this.settings.get('emoji'))
			return res;

	  	res.props.children.unshift(
			React.createElement('div', {
				className: classes.button,
				onClick: () => reactionManager.addReaction(props.channel.id, props.message.id, {
				animated: false,
				name: this.settings.get('emoji'),
				id: null
				})
			},
			React.createElement('img', { className: `emoji ${classes.icon}` })
		  ));
		  
	  	return res;
	});

	MiniPopover.default.displayName = 'MiniPopover';
  }

	pluginWillUnload() {
		uninject('react-button');
		powercord.api.settings.unregisterSettings('quickstar');
	}
};
