import config from '../config.js';
/*****************************************************************************
 *                                                                           *
 *                     Developed By STANY TZ                                 *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/Stanytz378/iamlegendv2                 *
 *  ▶️  YouTube  : https://youtube.com/@STANYTZ                              *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7fzu4EwEjmsD4Tzs1p     *
 *                                                                           *
 *    © 2026 STANY TZ. All rights reserved.                                 *
 *                                                                           *
 *****************************************************************************/
import commandHandler from '../lib/commandHandler.js';
import path from 'path';
import fs from 'fs';

// ═══════════════════════════════════════════════════════════
// 🕐 TIME & GREETING
// ═══════════════════════════════════════════════════════════

function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { period: 'morning', sign: '☀' };
    if (hour >= 12 && hour < 18) return { period: 'afternoon', sign: '☁' };
    if (hour >= 18 && hour < 21) return { period: 'evening', sign: '☾' };
    return { period: 'night', sign: '✦' };
}

function getGreeting(period, name) {
    const greetings = {
        morning: [`👋 Good morning, ${name}`, `👋 Rise and shine, ${name}`, `👋 Morning vibes, ${name}`],
        afternoon: [`👋 Good afternoon, ${name}`, `👋 Afternoon energy, ${name}`, `👋 Keep going, ${name}`],
        evening: [`👋 Good evening, ${name}`, `👋 Evening calm, ${name}`, `👋 Unwind time, ${name}`],
        night: [`👋 Good night, ${name}`, `👋 Late night mode, ${name}`, `👋 Rest well, ${name}`]
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

// ═══════════════════════════════════════════════════════════
// 📋 COMMAND FORMATTER
// ═══════════════════════════════════════════════════════════

function formatCommands(categories, prefix) {
    const result = [];
    let totalCount = 0;
    
    for (const [cat, cmds] of categories) {
        const catData = { category: cat, count: cmds.length, commands: [] };
        totalCount += cmds.length;
        
        for (const cmdName of cmds) {
            const cmd = commandHandler.commands.get(cmdName);
            if (!cmd) continue;
            const desc = cmd.description || cmd.usage || 'No description';
            catData.commands.push({ name: cmdName, description: desc });
        }
        result.push(catData);
    }
    result.total = totalCount;
    return result;
}

// ═══════════════════════════════════════════════════════════
// 🎨 20 PREMIUM STYLES (SHORT BORDERS • SPACING • DARK MODE)
// ═══════════════════════════════════════════════════════════

const menuStyles = [
    // 1: Premium Box
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        const b = dark ? '┃' : '│';
        const line = dark ? '━' : '─';
        let t = `┌${line.repeat(20)}┐\n`;
        t += `${b}  IAMLEGEND  ${b}\n`;
        t += `├${line.repeat(20)}┤\n`;
        t += `${b} ${timeSign} ${greeting} ${b}\n`;
        t += `${b} ⏱ ${info.time} • ${chatType} ${b}\n`;
        t += `${b} ${quote} ${b}\n`;
        t += `├${line.repeat(20)}┤\n`;
        t += `${b} Owner: ${info.owner} ${b}\n`;
        t += `${b} Total: ${formattedCategories.total} commands ${b}\n`;
        t += `└${line.repeat(20)}┘\n\n`;
        for (const cat of formattedCategories) {
            t += `      ${cat.category}\n`;
            t += `      [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 2: Clean Edge
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `╭────────────────╮\n`;
        t += `│ IAMLEGEND │\n`;
        t += `╰────────────────╯\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        for (const cat of formattedCategories) {
            t += `   ${cat.category}\n`;
            t += `   [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 3: Minimal Line
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `── IAMLEGEND ──\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner} | Total: ${formattedCategories.total}\n\n`;
        for (const cat of formattedCategories) {
            t += `   ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 4: Soft Frame
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
        t += ` IAMLEGEND\n`;
        t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
        t += ` ${timeSign} ${greeting}\n`;
        t += ` ⏱ ${info.time} • ${chatType}\n`;
        t += ` ${quote}\n`;
        t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n`;
        t += ` Owner: ${info.owner}\n`;
        t += ` Total: ${formattedCategories.total}\n`;
        t += `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n\n`;
        for (const cat of formattedCategories) {
            t += `   ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 5: Sharp Corner
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `┌──────────────┐\n`;
        t += `│IAMLEGEND│\n`;
        t += `└──────────────┘\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        for (const cat of formattedCategories) {
            t += `   ${cat.category}\n`;
            t += `   [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 6: Simple Bar
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `│ IAMLEGEND │\n`;
        t += `─────────────────\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        t += `─────────────────\n\n`;
        for (const cat of formattedCategories) {
            t += `   ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 7: Elegant Thin
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `╭──────────────╮\n`;
        t += `│IAMLEGEND│\n`;
        t += `╰──────────────╯\n\n`;
        t += `${timeSign} ${greeting} • ⏱ ${info.time}\n`;
        t += `${chatType} • ${quote}\n\n`;
        t += `Owner: ${info.owner} | Total: ${formattedCategories.total}\n\n`;
        for (const cat of formattedCategories) {
            t += `   ${cat.category}\n`;
            t += `   [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 8: Classic Minimal
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `═════════════════\n`;
        t += `  IAMLEGEND\n`;
        t += `═════════════════\n\n`;
        t += `  ${timeSign} ${greeting}\n`;
        t += `  ⏱ ${info.time} • ${chatType}\n`;
        t += `  ${quote}\n\n`;
        t += `  Owner: ${info.owner}\n`;
        t += `  Total: ${formattedCategories.total}\n\n`;
        t += `═════════════════\n\n`;
        for (const cat of formattedCategories) {
            t += `   ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 9: Fresh Line
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `IAMLEGEND\n`;
        t += `─────────────\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        for (const cat of formattedCategories) {
            t += `   ${cat.category}\n`;
            t += `   [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `   ${prefix}${cmd.name}\n`;
                t += `   └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 10: Smooth Edge
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `╌──────────────╌\n`;
        t += `  IAMLEGEND\n`;
        t += `╌──────────────╌\n\n`;
        t += `  ${timeSign} ${greeting}\n`;
        t += `  ⏱ ${info.time}\n`;
        t += `  ${chatType}\n`;
        t += `  ${quote}\n\n`;
        t += `  Owner: ${info.owner}\n`;
        t += `  Total: ${formattedCategories.total}\n\n`;
        t += `╌──────────────╌\n\n`;
        for (const cat of formattedCategories) {
            t += `  ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `    ${prefix}${cmd.name}\n`;
                t += `    └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 11: Pure Minimal
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `IAMLEGEND\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        for (const cat of formattedCategories) {
            t += `${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `  ${prefix}${cmd.name}\n`;
                t += `  └> ${cmd.description}\n\n`;
            }
        }
        return t.trim();
    }},
    
    // 12: Clean Box
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `┌─────────────>\n`;
        t += `│IAMLEGEND│\n`;
        t += `├─────────────>\n`;
        t += `│${timeSign} ${greeting}│\n`;
        t += `│⏱ ${info.time} • ${chatType}│\n`;
        t += `│${quote}│\n`;
        t += `├────────────>\n`;
        t += `│Owner: ${info.owner}│\n`;
        t += `│Total: ${formattedCategories.total}│\n`;
        t += `└─────────────>\n\n`;
        for (const cat of formattedCategories) {
            t += `  ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `  ${prefix}${cmd.name}\n`;
                t += `  └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 13: Slim Frame
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `│─────────────>\n`;
        t += `│  IAMLEGEND  │\n`;
        t += `│────────────•\n`;
        t += `│${timeSign} ${greeting}│\n`;
        t += `│⏱ ${info.time}│\n`;
        t += `│${chatType}│\n`;
        t += `│${quote}│\n`;
        t += `│─────────────│\n`;
        t += `│Owner: ${info.owner}│\n`;
        t += `│Total: ${formattedCategories.total}│\n`;
        t += `│─────────────•\n\n`;
        for (const cat of formattedCategories) {
            t += `│ ${cat.category} [${cat.count}]\n`;
            for (const cmd of cat.commands) {
                t += `│  ${prefix}${cmd.name}\n`;
                t += `│  └> ${cmd.description}\n`;
            }
            t += `│\n`;
        }
        t += `│─────────────•`;
        return t;
    }},
    
    // 14: Light Border
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `╭────────────╮\n`;
        t += `│IAMLEGEND│\n`;
        t += `╰────────────╯\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        for (const cat of formattedCategories) {
            t += `  ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `  ${prefix}${cmd.name}\n`;
                t += `  └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 15: Ultimate Clean
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `IAMLEGEND\n`;
        t += `──────────────\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        t += `──────────────\n\n`;
        for (const cat of formattedCategories) {
            t += `  ${cat.category}\n`;
            t += `  [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `  ${prefix}${cmd.name}\n`;
                t += `  └> ${cmd.description}\n\n`;
            }
        }
        t += `──────────────`;
        return t;
    }},
    
    // 16: Dot Border
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `•••••••••••••••\n`;
        t += `  IAMLEGEND\n`;
        t += `•••••••••••••••\n\n`;
        t += `  ${timeSign} ${greeting}\n`;
        t += `  ⏱ ${info.time} • ${chatType}\n`;
        t += `  ${quote}\n\n`;
        t += `  Owner: ${info.owner}\n`;
        t += `  Total: ${formattedCategories.total}\n\n`;
        t += `•••••••••••••••\n\n`;
        for (const cat of formattedCategories) {
            t += `  ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `    ${prefix}${cmd.name}\n`;
                t += `    └> ${cmd.description}\n\n`;
            }
        }
        t += `•••••••••••••••`;
        return t;
    }},
    
    // 17: Angle Frame
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `•────────────•\n`;
        t += `│IAMLEGEND│\n`;
        t += `•────────────•\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        for (const cat of formattedCategories) {
            t += `  ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `  ${prefix}${cmd.name}\n`;
                t += `  └> ${cmd.description}\n\n`;
            }
        }
        return t;
    }},
    
    // 18: Double Line
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `═────────────═\n`;
        t += `  IAMLEGEND\n`;
        t += `═────────────═\n\n`;
        t += `  ${timeSign} ${greeting}\n`;
        t += `  ⏱ ${info.time}\n`;
        t += `  ${chatType}\n`;
        t += `  ${quote}\n\n`;
        t += `  Owner: ${info.owner}\n`;
        t += `  Total: ${formattedCategories.total}\n\n`;
        t += `═────────────═\n\n`;
        for (const cat of formattedCategories) {
            t += `  ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `    ${prefix}${cmd.name}\n`;
                t += `    └> ${cmd.description}\n\n`;
            }
        }
        t += `═────────────═`;
        return t;
    }},
    
    // 19: Compact Box
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `┌─ IAMLEGEND\n│\n`;
        t += `│ ${timeSign} ${greeting}\n`;
        t += `│ ⏱ ${info.time} • ${chatType}\n`;
        t += `│ ${quote}\n│\n`;
        t += `│ Owner: ${info.owner}\n`;
        t += `│ Total: ${formattedCategories.total}\n│\n`;
        for (const cat of formattedCategories) {
            t += `│ ${cat.category} [${cat.count}]\n`;
            for (const cmd of cat.commands) {
                t += `│  ${prefix}${cmd.name}\n`;
                t += `│  └> ${cmd.description}\n`;
            }
            t += `│\n`;
        }
        t += `└─`;
        return t;
    }},
    
    // 20: Minimal Edge (DARK MODE DEFAULT)
    { render: ({ greeting, quote, info, formattedCategories, prefix, timeSign, chatType, dark }) => {
        let t = `IAMLEGEND\n`;
        t += `──────────────────\n\n`;
        t += `${timeSign} ${greeting}\n`;
        t += `⏱ ${info.time} • ${chatType}\n`;
        t += `${quote}\n\n`;
        t += `Owner: ${info.owner}\n`;
        t += `Total: ${formattedCategories.total}\n\n`;
        t += `──────────────────\n\n`;
        for (const cat of formattedCategories) {
            t += `  ${cat.category} [${cat.count}]\n\n`;
            for (const cmd of cat.commands) {
                t += `  ${prefix}${cmd.name}\n`;
                t += `  └> ${cmd.description}\n\n`;
            }
        }
        t += `──────────────────`;
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
    usage: '.menu [command|style#|dark]',
    
    async handler(sock, message, args, context) {
        const { chatId, channelInfo, senderName, isGroup, isPrivate } = context;
        const prefix = config.prefixes[0];
        const imagePath = path.join(process.cwd(), 'assets/thumb.png');
        
        // ─── Handle specific command lookup ───
        if (args.length) {
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
        const userName = senderName || 'Legend';
        const timeInfo = getTimePeriod();
        const greeting = getGreeting(timeInfo.period, userName);
        const quote = await fetchRandomQuote();
        const formattedCategories = formatCommands(commandHandler.categories, prefix);
        const chatType = getChatType({ isGroup, isPrivate });
        
        // ─── Dark mode & style selector ───
        const darkMode = args.some(a => a.toLowerCase() === 'dark');
        const styleArg = args.find(a => /^style?\d+$/i.test(a));
        const styleIndex = styleArg ? parseInt(styleArg.replace(/\D/g,'')) - 1 : -1;
        const style = (styleIndex >= 0 && styleIndex < menuStyles.length) 
            ? menuStyles[styleIndex] 
            : pick(menuStyles);
        
        // ─── Render menu ───
        const text = style.render({
            greeting,
            quote,
            prefix,
            timeSign: timeInfo.sign,
            chatType,
            dark: darkMode,
            formattedCategories,
            info: {
                bot: config.botName,
                owner: config.ownerName || 'STANY TZ',
                prefix: config.prefixes.join(', '),
                total: commandHandler.commands.size,
                version: config.version || "6.0.0",
                time: formatTime()
            }
        });
        
        // ─── Send message ───
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chatId, {
                image: { url: imagePath },
                caption: text,
                ...channelInfo
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
        }
    }
};

/*****************************************************************************
 *                     Developed By STANY TZ                                 *
 *****************************************************************************/

