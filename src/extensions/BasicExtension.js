const util = require("util");
const DiscordJS = require("discord.js");
const Extension = require("../hooks/Extension");
const Misc = require("../primitives/Misc");
const Command = require("../commands/Command");

class BasicExtension extends Extension {
    /**
     * @param {Host} host
     */
    constructor(host) {
        super(host);
    }

    static get id() { return "basic"; }

    onStart() {
        this.host.commandHandler.commandList.add(...commands);
    }
    onStop() {
        this.host.commandHandler.commandList.remove(...commands);
    }
}

const commands = [
    new Command(BasicExtension, "help", "", "display available commands", (host, args, message) => {
        const commands = host.commandHandler.commandList.commands;
        const fields = Object.keys(commands).map(v => {
                const cmd = commands[v];
                return {
                    name: Misc.format("**$1** $2", cmd.name, cmd.args),
                    value: Misc.format("$1", cmd.desc),
                    inline: false
                };
            });
        const embed = Misc.embed(host.client.user, message.author, null, null, fields);
        host.clientManager.respondEmbed(message.channel, embed);
    }),
    new Command(BasicExtension, "ping", "", "display ping measurements", (host, args, message) => {
        const execute = host.preciseTime;

        const delay = execute - host.messageHandler.lastMessageTime;
        let trip;
        const gateway = host.client.ping;

        const content = Misc.emotes["info"] + "\ngateway: `$1` ms\nexecute `$2` ms\ntrip `$3` ms";
        host.clientManager.send(message.channel, content, gateway, delay, "?")
            .then(v => {
                if (!v) return;
                trip = host.preciseTime - execute;
                v && v.edit(Misc.format(content, gateway, delay, trip))
            });
    }),
    new Command(BasicExtension, "status", "", "display bot status", async (host, args, message) => {
        const memory = Misc.prettyMemoryData(process.memoryUsage());

        const embed = Misc.embed(host.client.user, message.author, null, null, [
            {
                name: "Version",
                value: Misc.version,
                inline: true
            },
            {
                name: "Owner",
                value: host.settings.hostOwner != null ? `<@${host.settings.hostOwner}>` : "nobody",
                inline: true
            },
            {
                name: "Uptime",
                value: Misc.prettyTime((host.time - host.runTime) / 1000),
                inline: true
            },
            {
                name: "Guilds",
                value: host.clientManager.client.guilds.size,
                inline: true
            },
            {
                name: "Users",
                value: host.clientManager.client.guilds.map(v => v.memberCount).reduce((a, b) => a + b),
                inline: true
            },
            {
                name: "Memory",
                value: Misc.format("$1", memory.rss),
                inline: true
            }
        ]);
        host.clientManager.respondEmbed(message.channel, embed);
    }),
];

module.exports = BasicExtension;

const Host = require("../Host");
