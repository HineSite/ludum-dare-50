import { Platform } from './platform.js';

Platform.Platforms = [
    new Platform('left-open', '', 0, 115, 400, 20, false),
    new Platform('left-open right-open', '', 200, 325, 150, 20, true),
    new Platform('left-open right-open', '', 475, 325, 150, 20, true),
    new Platform('right-open', '', 0, 440, 200, 20, true),
    new Platform('spiked', '', 102, 460, 88, 20, true, 25), // 88 | 117
];
