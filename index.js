const { resolve } = require('path');
const { Plugin } = require('powercord/entities');
const { forceUpdateElement } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');

module.exports = class Star extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.css'));

    const reactionManager = await getModule([ 'addReaction' ]);
    // @todo: make this less stupid
    const module = await getModule(m => typeof m.default === 'function' && m.default.toString().match(/showEmojiPicker:[^,]+,showMoreUtilities:/));

    inject('star-button', module, 'default', (args, res) => {
      const renderer = res.type.type;
      res.type = (props) => {
        const res = renderer(props);
        const reactions = res && res.props.children && res.props.children.props.children && res.props.children.props.children[1];
        if (reactions) {
          const renderer = reactions.type;
          reactions.type = (props) => {
            const res = renderer(props);
            res.props.children.unshift(res.props.children[1]);
            res.props.children.unshift(React.createElement(
              'div', {
                className: 'emojiButton-jE9tXC button-1ZiXG9',
                onClick: () => reactionManager.addReaction(props.channel.id, props.message.id, {
                  animated: false,
                  name: '⭐',
                  id: null
                })
              },
              React.createElement('img', {
                className: 'emoji icon-3Gkjwa',
                src: 'https://canary.discordapp.com/assets/e4d52f4d69d7bba67e5fd70ffe26b70d.svg'
              })
            ));
            return res;
          };
        }
        return res;
      };
      return res;
    });
  }

  pluginWillUnload () {
    uninject('star-button');
    forceUpdateElement('.pc-message', true);
  }
};
