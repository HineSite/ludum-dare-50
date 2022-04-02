import { GameLoop } from './GameLoop.js';
import { Player } from './player.js';
import { Vector2 } from './vector2.js';

(function ($) {
    $(function() {
        let debugLogs = false;
        let gameLoop = new GameLoop(onRun, onStart, onStop, onPause, onResume, 60);
        let viewport = $(window);
        let documentHasFocus = true;
        let userPaused = false;

        let gravity = 200; // pixels/second

        let skyler = new Player($('#skyler'), 550, 0, gravity, gravity);

        gameLoop.logger = (type, message) => {
            logType(type, message);
        };

        gameLoop.initialize(() => {
            $(window).on('keydown', function (event) {
                if (event.keyCode === 32 || event.keyCode === 87 || event.keyCode === 38 || // space | 'w' | up arrow
                    event.keyCode === 37 || event.keyCode === 65 || // left arrow | 'a'
                    event.keyCode === 39 || event.keyCode === 68) { // right arrow | 'd'
                    event.preventDefault();

                    if (gameLoop.loopState === GameLoop.LoopState.STOPPED) {
                        gameLoop.start();
                    }
                    else if (gameLoop.loopState === GameLoop.LoopState.PAUSED) {
                        userPaused = false;
                        gameLoop.resume();
                    }
                }

                if (event.keyCode === 32 || event.keyCode === 87 || event.keyCode === 38) { // space | 'w' | up arrow
                    skyler.jump();
                }
                else if (event.keyCode === 37 || event.keyCode === 65) { // left arrow | 'a'
                    skyler.moveLeft();
                }
                else if (event.keyCode === 39 || event.keyCode === 68) { // right arrow | 'd'
                    skyler.moveRight();
                }
            });

            $(window).on('keyup', function (event) {
                if (gameLoop.loopState === GameLoop.LoopState.RUNNING) {
                    if (event.keyCode === 37 || event.keyCode === 65 ||  // left arrow | 'a'
                        event.keyCode === 39 || event.keyCode === 68) { // right arrow | 'd'
                        event.preventDefault();
                        skyler.stopMoving();
                    }
                }
            });
        });

        function pause() {
            gameLoop.pause(() => {
                if (!userPaused && document.hasFocus()) {
                    documentHasFocus = true;
                    gameLoop.resume();
                }
            }, 600);
        }

        function onRun (delayMilli, delaySeconds) {
            if (!document.hasFocus()) {
                if (documentHasFocus) {
                    pause();
                }

                documentHasFocus = false;
                return;
            }

            skyler.update(delaySeconds);
        }

        function onStart () {
            log(GameLoop.LogType.INFO, 'Loop State', 'Started');
        }

        function onStop () {
            if (gameLoop.loopState !== GameLoop.LoopState.STOPPED)
                return;

            log(GameLoop.LogType.INFO, 'Loop State', 'Stopped');
        }

        function onPause () {
            if (gameLoop.loopState !== GameLoop.LoopState.PAUSED)
                return;

            log(GameLoop.LogType.INFO, 'Loop State', 'Paused');
        }

        function onResume () {
            log(GameLoop.LogType.INFO, 'Loop State', 'Resumed');
        }

        function log(type, title, message) {
            logType(type, title + ': ' + message);
        }

        function logType(type, message) {
            if (!debugLogs && type === GameLoop.LogType.DEBUG)
                return;

            console.log(type.description + ' - ' + message);
        }
    });
})(jQuery);
