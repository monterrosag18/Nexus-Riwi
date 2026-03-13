const BANNED_WORDS = [
    'fuck', 'shit', 'asshole', 'bitch', 'idiot', 'noob', 'dummy',
    'puto', 'mierda', 'estupido', 'pendejo', 'gonorrea'
];

export function filterChat(text) {
    if (!text) return "";
    let filtered = text;
    BANNED_WORDS.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        filtered = filtered.replace(regex, '****');
    });
    return filtered;
}
