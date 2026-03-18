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
 *    Description: Tic-Tac-Toe game plugin for iamlegendv2 WhatsApp Bot     *
 *                                                                           *
 ***************************************************************************/

// Game state storage (in-memory)
const games = new Map();

function createBoard() {
    return ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'];
}

function renderBoard(board) {
    let str = '';
    for (let i = 0; i < 9; i += 3) {
        str += `${board[i]} ${board[i+1]} ${board[i+2]}\n`;
    }
    return str;
}

function checkWinner(board) {
    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8], // rows
        [0,3,6], [1,4,7], [2,5,8], // columns
        [0,4,8], [2,4,6]           // diagonals
    ];
    for (let pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (board[a] !== '⬜' && board[a] === board[b] && board[b] === board[c]) {
            return board[a]; // '❌' or '⭕'
        }
    }
    return null;
}

function isBoardFull(board) {
    return board.every(cell => cell !== '⬜');
}

// ---------- NAMED EXPORT for move handling ----------
export async function handleTicTacToeMove(sock, chatId, senderId, move, context) {
    const { channelInfo } = context;
    const game = games.get(chatId);
    if (!game || !game.active) return false;

    // Check if it's the player's turn
    if (game.turn !== senderId) return false;

    // Check if sender is one of the players
    if (!game.players.includes(senderId)) return false;

    const moveNum = parseInt(move);
    if (isNaN(moveNum) || moveNum < 1 || moveNum > 9) return false;

    const index = moveNum - 1;
    if (game.board[index] !== '⬜') {
        await sock.sendMessage(chatId, {
            text: '❌ That cell is already taken! Choose another.',
            ...channelInfo
        });
        return true; // consumed but move invalid
    }

    // Place mark
    const mark = game.players[0] === senderId ? '❌' : '⭕';
    game.board[index] = mark;

    // Check winner
    const winner = checkWinner(game.board);
    if (winner) {
        const winnerJid = game.players.find(p => p === senderId);
        const winnerName = winnerJid.split('@')[0];
        const boardStr = renderBoard(game.board);
        await sock.sendMessage(chatId, {
            text: `🎉 *Game Over!*\n\n` +
                  `${boardStr}\n\n` +
                  `🏆 @${winnerName} wins! 🏆`,
            mentions: [winnerJid],
            ...channelInfo
        });
        games.delete(chatId);
        return true;
    }

    // Check draw
    if (isBoardFull(game.board)) {
        const boardStr = renderBoard(game.board);
        await sock.sendMessage(chatId, {
            text: `🤝 *It's a draw!*\n\n${boardStr}`,
            ...channelInfo
        });
        games.delete(chatId);
        return true;
    }

    // Switch turn
    game.turn = game.players.find(p => p !== senderId);
    const nextPlayer = game.turn.split('@')[0];
    const boardStr = renderBoard(game.board);
    await sock.sendMessage(chatId, {
        text: `✅ Move accepted.\n\n${boardStr}\n\n` +
              `Now it's @${nextPlayer}'s turn.`,
        mentions: [game.turn],
        ...channelInfo
    });

    return true;
}

// ---------- DEFAULT EXPORT (command) ----------
export default {
    command: 'tictactoe',
    aliases: ['ttt', 'game'],
    category: 'games',
    description: 'Play Tic-Tac-Toe with a friend',
    usage: '.ttt @user',
    async handler(sock, message, args, context) {
        const { chatId, senderId, isGroup, channelInfo } = context;
        
        if (!isGroup) {
            return sock.sendMessage(chatId, {
                text: '❌ This command can only be used in groups.',
                ...channelInfo
            }, { quoted: message });
        }

        // Check if there's a mentioned user or reply
        let opponent = null;
        if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            opponent = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (args.length > 0) {
            // Try to parse as mention or number
            const input = args[0].replace(/[^0-9]/g, '');
            if (input.length >= 10) {
                opponent = `${input}@s.whatsapp.net`;
            }
        }

        if (!opponent) {
            return sock.sendMessage(chatId, {
                text: '❌ Please mention the user you want to play with.\nExample: .ttt @player',
                ...channelInfo
            }, { quoted: message });
        }

        if (opponent === senderId) {
            return sock.sendMessage(chatId, {
                text: '❌ You cannot play with yourself!',
                ...channelInfo
            }, { quoted: message });
        }

        // Check if a game already exists in this chat
        if (games.has(chatId)) {
            return sock.sendMessage(chatId, {
                text: '❌ A game is already in progress in this group.',
                ...channelInfo
            }, { quoted: message });
        }

        // Create new game
        games.set(chatId, {
            board: createBoard(),
            players: [senderId, opponent],
            turn: senderId,
            active: true
        });

        const boardStr = renderBoard(games.get(chatId).board);
        await sock.sendMessage(chatId, {
            text: `🎮 *Tic-Tac-Toe Game Started!*\n\n` +
                  `Player 1: @${senderId.split('@')[0]} (❌)\n` +
                  `Player 2: @${opponent.split('@')[0]} (⭕)\n\n` +
                  `It's @${senderId.split('@')[0]}'s turn.\n\n` +
                  `${boardStr}\n\n` +
                  `Use numbers 1-9 to place your mark.`,
            mentions: [senderId, opponent],
            ...channelInfo
        }, { quoted: message });
    }
};