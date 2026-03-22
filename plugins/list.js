import config from '../config.js';
import commandHandler from '../lib/commandHandler.js';
import path from 'path';
import fs from 'fs';

// ─────────────────────────────────────────────────────────────
// 🕐 TIME, GREETING & QUOTE HELPERS
// ─────────────────────────────────────────────────────────────

function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { period: 'morning', sign: '☀' };
    if (hour >= 12 && hour < 18) return { period: 'afternoon', sign: '☁' };
    if (hour >= 18 && hour < 21) return { period: 'evening', sign: '☾' };
    return { period: 'night', sign: '✦' };
}

function getGreeting(period, name) {
    const greetings = {
        morning: [`Good morning, @${name}`, `Rise and shine, @${name}`, `Morning vibes, @${name}`],
        afternoon: [`Good afternoon, @${name}`, `Afternoon energy, @${name}`, `Keep going, @${name}`],
        evening: [`Good evening, @${name}`, `Evening calm, @${name}`, `Unwind time, @${name}`],
        night: [`Good night, @${name}`, `Late night mode, @${name}`, `Rest well, @${name}`]
    };
    const list = greetings[period] || greetings.evening;
    return list[Math.floor(Math.random() * list.length)];
}

async function fetchRandomQuote() {
    const APIs = [
        `https://shizoapi.onrender.com/api/texts/quotes?apikey=shizo`,
        `https://discardapi.dpdns.org/api/quotes/random?apikey=guru`
    ];
    for (const url of APIs) {
        try {
            const res = await fetch(url, { timeout: 5000 });
            if (!res.ok) continue;
            const data = await res.json();
            return data?.quote || data?.text || data?.message || data?.body || "Stay legendary";
        } catch (e) { continue; }
    }
    const fallbacks = [
        "Code with passion, deploy with pride.",
        "Every expert was once a beginner.",
        "Stay legendary, stay humble.",
        "Dream big, code bigger.",
        "Your potential is endless."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false,
        timeZone: config.timeZone || 'Africa/Nairobi'
    });
}

function getChatType(context) {
    const { isGroup, isPrivate } = context;
    if (isPrivate) return 'Private';
    if (isGroup) return 'Group';
    return 'Channel';
}

// ─────────────────────────────────────────────────────────────
// 📋 COMMAND FORMATTER (includes aliases)
// ─────────────────────────────────────────────────────────────

function formatCommands(categories, prefix) {
    const result = [];
    let totalCount = 0;
    for (const [cat, cmds] of categories) {
        const catUpper = cat.toUpperCase();
        const catData = { category: catUpper, count: cmds.length, commands: [] };
        totalCount += cmds.length;
        for (const cmdName of cmds) {
            const cmd = commandHandler.commands.get(cmdName);
            if (!cmd) continue;
            const desc = cmd.description || cmd.usage || 'No description';
            const nameUpper = cmdName.toUpperCase();
            // Aliases: store as an array of strings without prefix (for rendering)
            const aliases = cmd.aliases || [];
            catData.commands.push({ name: nameUpper, description: desc, aliases });
        }
        result.push(catData);
    }
    result.total = totalCount;
    return result;
}

// Category emojis mapping – you can extend this list
const categoryEmojis = {
    'GENERAL': '📱',
    'OWNER': '👑',
    'ADMIN': '🛡️',
    'GROUP': '👥',
    'DOWNLOAD': '📥',
    'AI': '🤖',
    'SEARCH': '🔍',
    'APKS': '📲',
    'INFO': 'ℹ️',
    'FUN': '🎮',
    'STALK': '👀',
    'GAMES': '🎮',
    'IMAGES': '🖼️',
    'MENU': '📜',
    'TOOLS': '🔧',
    'STICKERS': '🎭',
    'QUOTES': '💬',
    'MUSIC': '🎵',
    'UTILITY': '📂',
    // default fallback
    'DEFAULT': '📁'
};

function getCategoryEmoji(category) {
    return categoryEmojis[category] || categoryEmojis.DEFAULT;
}

// ─────────────────────────────────────────────────────────────
// 📄 RENDER A CATEGORY BLOCK (new style with aliases on separate line)
// ─────────────────────────────────────────────────────────────

function renderCategory(cat, prefix) {
    const emoji = getCategoryEmoji(cat.category);
    let block = `├─────▶ ${emoji} ${cat.category}\n\n`;
    for (const cmd of cat.commands) {
        // Command name line
        block += `├➣ *${cmd.name}*\n`;
        // Aliases line (if any)
        if (cmd.aliases && cmd.aliases.length) {
            const aliasLine = cmd.aliases.map(a => `${prefix}${a}`).join(', ');
            block += `├${aliasLine}\n`;
        }
        // Description line
        block += `╰➣ ${cmd.description}\n\n`;
    }
    return block;
}

// ─────────────────────────────────────────────────────────────
// 🎨 20 STYLES (borders only, internal layout unified)
// ─────────────────────────────────────────────────────────────

const menuStyles = [
    // 1: Premium Box
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `┌─────────────────┐\n`;
        t += `│   IAMLEGEND     │\n`;
        t += `├─────────────────┤\n`;
        t += `│ ${timeSign} ${greeting}\n`;
        t += `│ ⏱ ${info.time}  •  ${chatType}\n`;
        t += `│ ${quote}\n`;
        t += `├─────────────────┤\n`;
        t += `│ Owner: ${info.owner}\n`;
        t += `│ Total: ${info.total} commands\n`;
        t += `└─────────────────┘\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `───────────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 2: Clean Edge
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `╭─────────────────╮\n`;
        t += `│   IAMLEGEND     │\n`;
        t += `╰─────────────────╯\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `───────────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 3: Minimal Line
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `── IAMLEGEND ──\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}  |  Total: ${info.total}\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `───────────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 4: Soft Frame
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
        t += ` IAMLEGEND\n`;
        t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
        t += ` ${timeSign} ${greeting}\n`;
        t += ` ⏱ ${info.time}  •  ${chatType}\n`;
        t += ` ${quote}\n`;
        t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
        t += ` Owner: ${info.owner}\n`;
        t += ` Total: ${info.total} commands\n`;
        t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 5: Sharp Corner
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `┌──────────────┐\n`;
        t += `│IAMLEGEND│\n`;
        t += `└──────────────┘\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `───────────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 6: Simple Bar
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `│ IAMLEGEND │\n`;
        t += `─────────────────\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
        t += `─────────────────\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `─────────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 7: Elegant Thin
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `╭──────────────╮\n`;
        t += `│IAMLEGEND│\n`;
        t += `╰──────────────╯\n\n`;
        t += `${timeSign} ${greeting}  •  ⏱ ${info.time}\n`;
        t += `${chatType}  •  ${quote}\n\n`;
        t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `───────────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 8: Classic Minimal
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `═════════════════\n`;
        t += `  IAMLEGEND\n`;
        t += `═════════════════\n\n`;
        t += `  ${timeSign} ${greeting}\n`;
        t += `  ⏱ ${info.time}  •  ${chatType}\n`;
        t += `  ${quote}\n\n`;
        t += `  Owner: ${info.owner}\n`;
        t += `  Total: ${info.total} commands\n\n`;
        t += `═════════════════\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `═════════════════\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 9: Fresh Line
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `IAMLEGEND\n`;
        t += `─────────────\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `─────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 10: Smooth Edge
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `╌──────────────╌\n`;
        t += `  IAMLEGEND\n`;
        t += `╌──────────────╌\n\n`;
        t += `  ${timeSign} ${greeting}\n`;
        t += `  ⏱ ${info.time}\n`;
        t += `  ${chatType}\n`;
        t += `  ${quote}\n\n`;
        t += `  Owner: ${info.owner}\n`;
        t += `  Total: ${info.total} commands\n\n`;
        t += `╌──────────────╌\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `╌──────────────╌\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 11: Pure Minimal
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `IAMLEGEND\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `───────────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 12: Clean Box
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `┌───────────┐\n`;
        t += `│IAMLEGEND│\n`;
        t += `├───────────┤\n`;
        t += `│${timeSign} ${greeting}│\n`;
        t += `│⏱ ${info.time}  •  ${chatType}│\n`;
        t += `│${quote}│\n`;
        t += `├───────────┤\n`;
        t += `│Owner: ${info.owner}│\n`;
        t += `│Total: ${info.total}│\n`;
        t += `└───────────┘\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `─────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 13: Slim Frame
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `│─────────────│\n`;
        t += `│  IAMLEGEND  │\n`;
        t += `│─────────────│\n`;
        t += `│${timeSign} ${greeting}│\n`;
        t += `│⏱ ${info.time}│\n`;
        t += `│${chatType}│\n`;
        t += `│${quote}│\n`;
        t += `│─────────────│\n`;
        t += `│Owner: ${info.owner}│\n`;
        t += `│Total: ${info.total}│\n`;
        t += `│─────────────│\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `│─────────────│\n`;
        t += `│ 🔥 ${info.bot} v${info.version} │\n`;
        return t;
    }},
    // 14: Light Border
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `╭────────────╮\n`;
        t += `│IAMLEGEND│\n`;
        t += `╰────────────╯\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `─────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 15: Ultimate Clean
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `IAMLEGEND\n`;
        t += `──────────────\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${info.total} commands\n\n`;
        t += `──────────────\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `──────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 16: Dot Border
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `•••••••••••••••\n`;
        t += `  IAMLEGEND\n`;
        t += `•••••••••••••••\n\n`;
        t += `  ${timeSign} ${greeting}\n`;
        t += `  ⏱ ${info.time}  •  ${chatType}\n`;
        t += `  ${quote}\n\n`;
        t += `  Owner: ${info.owner}\n`;
        t += `  Total: ${info.total} commands\n\n`;
        t += `•••••••••••••••\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `•••••••••••••••\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 17: Angle Frame
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `•────────────•\n`;
        t += `│IAMLEGEND│\n`;
        t += `•────────────•\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}  •  Total: ${info.total}\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `─────────────\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 18: Double Line
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `═────────────═\n`;
        t += `  IAMLEGEND\n`;
        t += `═────────────═\n\n`;
        t += `  ${timeSign} ${greeting}\n`;
        t += `  ⏱ ${info.time}\n`;
        t += `  ${chatType}\n`;
        t += `  ${quote}\n\n`;
        t += `  Owner: ${info.owner}\n`;
        t += `  Total: ${info.total} commands\n\n`;
        t += `═────────────═\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `═────────────═\n`;
        t += `   🔥 ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 19: Compact Box
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `┌─ IAMLEGEND\n│\n`;
        t += `│ ${timeSign} ${greeting}\n`;
        t += `│ ⏱ ${info.time}  •  ${chatType}\n`;
        t += `│ ${quote}\n│\n`;
        t += `│ Owner: ${info.owner}\n`;
        t += `│ Total: ${info.total} commands\n│\n`;
        for (const cat of categories) {
            t += `│  ├─────▶ ${getCategoryEmoji(cat.category)} ${cat.category}\n│\n`;
            for (const cmd of cat.commands) {
                t += `│  ├➣ *${cmd.name}*\n`;
                if (cmd.aliases && cmd.aliases.length) {
                    t += `│  ├${cmd.aliases.map(a => `${prefix}${a}`).join(', ')}\n`;
                }
                t += `│  ╰➣ ${cmd.description}\n`;
            }
            t += `│\n`;
        }
        t += `└─\n`;
        t += `    ${info.bot} v${info.version}\n`;
        return t;
    }},
    // 20: Minimal Edge
    { render: ({ greeting, quote, info, categories, prefix, timeSign, chatType }) => {
        let t = `IAMLEGEND\n`;
        t += `──────────────────\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time}  •  ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${info.total} commands\n\n`;
        t += `──────────────────\n\n`;
        for (const cat of categories) t += renderCategory(cat, prefix);
        t += `──────────────────\n`;
        t += `    ${info.bot} v${info.version}\n`;
        return t;
    }}
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════
// 🤖 MAIN COMMAND HANDLER
// ═══════════════════════════════════════════════════════════

export default {
    command: 'menu',
    aliases: ['help', 'commands', 'h', 'list'],
    category: 'general',
    description: 'Show all commands with descriptions',
    usage: '.menu [command]',

    async handler(sock, message, args, context) {
        const { chatId, channelInfo, senderId, senderName, isGroup, isPrivate } = context;
        const prefix = config.prefixes[0];
        const imagePath = path.join(process.cwd(), 'assets/thumb.png');

        // ─── Handle command lookup ───
        if (args.length && args[0] !== 'style' && !args[0].match(/^\d+$/)) {
            const searchTerm = args[0].toLowerCase();
            let cmd = commandHandler.commands.get(searchTerm);
            if (!cmd && commandHandler.aliases.has(searchTerm)) {
                const mainCommand = commandHandler.aliases.get(searchTerm);
                cmd = commandHandler.commands.get(mainCommand);
            }
            if (!cmd) {
                return sock.sendMessage(chatId, {
                    text: `❌ Command "${args[0]}" not found.\n\nUse ${prefix}menu to see all commands.`,
                    ...channelInfo
                }, { quoted: message });
            }
            const text = `╭━━━━━━━━━━━━━━⬣
┃ 📌 COMMAND INFO
┃
┃ ⚡ Command: ${prefix}${cmd.command}
┃ 📝 Desc: ${cmd.description || 'No description'}
┃ 📖 Usage: ${cmd.usage || `${prefix}${cmd.command}`}
┃ 🏷️ Category: ${cmd.category || 'misc'}
┃ 🔖 Aliases: ${cmd.aliases?.length ? cmd.aliases.map(a => prefix + a).join(', ') : 'None'}
┃
╰━━━━━━━━━━━━━━⬣`;
            if (fs.existsSync(imagePath)) {
                return sock.sendMessage(chatId, {
                    image: { url: imagePath },
                    caption: text,
                    ...channelInfo
                }, { quoted: message });
            }
            return sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
        }

        // ─── Prepare dynamic content ───
        const userName = senderName || senderId.split('@')[0];
        const timeInfo = getTimePeriod();
        const greeting = getGreeting(timeInfo.period, userName);
        const quote = await fetchRandomQuote();
        const formattedCategories = formatCommands(commandHandler.categories, prefix);
        const chatType = getChatType({ isGroup, isPrivate });

        // ─── Select random style (or a specific one if given) ───
        const styleIndex = args.find(a => a.match(/^\d+$/));
        const style = styleIndex ? menuStyles[parseInt(styleIndex) - 1] : pick(menuStyles);

        // ─── Render menu using the chosen style ───
        const text = style.render({
            greeting,
            quote,
            prefix,
            timeSign: timeInfo.sign,
            chatType,
            categories: formattedCategories,
            info: {
                bot: config.botName,
                owner: config.botOwner || 'STANY TZ',
                prefix: config.prefixes.join(', '),
                total: commandHandler.commands.size,
                version: config.version || "6.0.0",
                time: formatTime()
            }
        });

        // ─── Send message with mention ───
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chatId, {
                image: { url: imagePath },
                caption: text,
                mentions: [senderId],
                ...channelInfo
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, {
                text,
                mentions: [senderId],
                ...channelInfo
            }, { quoted: message });
        }
    }
};