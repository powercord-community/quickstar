const { resolve } = require('path');
const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');

module.exports = class Star extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.css'));

    const reactionManager = await getModule([ 'addReaction' ]);
    const MessageContent = await getModuleByDisplayName('MessageContent');

    inject('star-contents', MessageContent.prototype, 'render', function (args) {
      const { renderButtons } = this.props;
      if (!this.props.patched) {
        this.props.patched = true;
        this.props.renderButtons = (e) => {
          const res = renderButtons(e);
          if (res.props.children && !e.message.reactions.find(r => r.emoji.name === '⭐' && r.me)) {
            res.props.children.props.children.unshift(
              React.createElement('img', {
                src: 'https://canary.discordapp.com/assets/e4d52f4d69d7bba67e5fd70ffe26b70d.svg',
                alt: 'Star',
                className: 'star-reaction-btn',
                onClick: () => reactionManager.addReaction(e.channel.id, e.message.id, {
                  animated: false,
                  name: '⭐',
                  id: null
                })
              })
            );
          }
          return res;
        };
      }
      return args;
    }, true);
  }

  pluginWillUnload () {
    this.unloadCSS();
    uninject('star-contents');
  }
};
