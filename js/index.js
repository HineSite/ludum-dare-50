import { GameLoop } from './GameLoop.js';

(function ($) {
    $(function() {
        let debugLogs = true;
        let gameLoop = new GameLoop(onRun, onStart, onStop, onPause, onResume, 60);
        let documentHasFocus = true;
        let userPaused = false;

        gameLoop.logger = (type, message) => {
            logType(type, message);
        };

        gameLoop.initialize(() => {
            $(window).on('keydown', function (event) {
                if (event.keyCode === 32) { // space
                    event.preventDefault();

                    if (gameLoop.loopState === GameLoop.LoopState.STOPPED) {
                        gameLoop.start();
                    }
                    else if (gameLoop.loopState === GameLoop.LoopState.PAUSED) {
                        userPaused = false;
                        gameLoop.resume();
                    }
                    else if (gameLoop.loopState === GameLoop.LoopState.RUNNING) {
                        userPaused = true;
                        pause();
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
