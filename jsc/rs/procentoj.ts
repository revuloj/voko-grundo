/*************************************************************************

// procento-traboj: (c) Changaco, https://github.com/Changaco/unicode-progress-bars
// adaptita de Wolfram Diestel

// cetero: (c) 2016-2023 ĉe Wolfram Diestel
// laŭ GPL 2.0

*****************************************************************************/


export const bar_styles = [
    '▁▂▃▄▅▆▇█',
    '⣀⣄⣤⣦⣶⣷⣿',
    '⣀⣄⣆⣇⣧⣷⣿',
    '○◔◐◕⬤',
    '□◱◧▣■',
    '□◱▨▩■',
    '□◱▥▦■',
    '░▒▓█',
    '░█',
    '⬜⬛',
    '▱▰',
    '▭◼',
    '▯▮',
    '◯⬤',
    '⚪⚫',
];

function repeat(s: string, i: number) {
    let r = '';
    for(let j=0; j<i; j++) r += s;
    return r;
}

export function make_percent_bar(p: number, bar_style: string, 
    min_size: number, max_size: number): {str: string, delta: number}
{
    var d: number, full: number, m: string, middle: number, r: string, 
        rest: number, x: number, min_delta = Number.POSITIVE_INFINITY,
        full_symbol = bar_style[bar_style.length-1],
        n = bar_style.length - 1;
    if(p == 100) return {str: repeat(full_symbol, max_size), delta: 0};
    p = p / 100;
    for(var i=max_size; i>=min_size; i--) {
        x = p * i;
        full = Math.floor(x);
        rest = x - full;
        middle = Math.floor(rest * n);
        if(p != 0 && full == 0 && middle == 0) middle = 1;
        d = Math.abs(p - (full+middle/n)/i) * 100;
        if(d < min_delta) {
            min_delta = d;
            m = bar_style[middle];
            if(full == i) m = '';
            r = repeat(full_symbol, full) + m + repeat(bar_style[0], i-full-1);
        }
    }
    return {str: r, delta: min_delta};
}
