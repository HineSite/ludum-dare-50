import { Platform } from './platform.js';

Platform.Platforms = [
    new Platform('left-open', '', 0, 115, 400, 20, false),
    new Platform('left-open right-open', '', 200, 325, 150, 20, true),
    new Platform('left-open right-open', '', 475, 325, 150, 20, true),
    new Platform('right-open', '', 0, 440, 200, 20, true),
    new Platform('spiked', '', 102, 460, 88, 20, true, 25), // 88 | 117
    new Platform('left-open right-open', '', 640, 640, 200, 20, true),
    new Platform('spiked', '', 742, 660, 88, 20, true, 25),
    new Platform('left-open', '', 0, 840, 400, 20, false),
    new Platform('left-open right-open', '', 200, 1050, 150, 20, true),
    new Platform('left-open right-open', '', 475, 1050, 150, 20, true),
];
