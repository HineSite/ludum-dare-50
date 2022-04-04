import { GameLoop } from './GameLoop.js';
import { Player } from './player.js';
import { Vector2 } from './vector2.js';
import { Platform } from './platform.js';

(function ($) {
    $(function() {
        let audio = {
            'themeAudio': document.querySelector('#themeAudio')
        };
        audio.themeAudio.volume = .25;

        let debugLogs = false;
        let gameLoop = new GameLoop(onRun, onStart, onStop, onPause, onResume, 60);
        let viewport = $(window);
        let platformsContainer = $('#platforms');
        let documentHasFocus = true;
        let userPaused = false;
        let health = $('#health');

        let gravity = 400; // pixels/second

        let skyler = new Player($('#skyler'), 1075, 137, 300, 600, gravity, audio);

        gameLoop.logger = (type, message) => {
            logType(type, message);
        };

        gameLoop.initialize(() => {
            loadPlatforms();
            loadAudio();
            $('#skyler').show();

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

        function loadPlatforms() {
            for (let i = 0; i < Platform.Platforms.length; i++) {
                platformsContainer.append($(Platform.Platforms[i].getHtml()));
            }
        }

        function pause() {
            gameLoop.pause(() => {
                if (!userPaused && document.hasFocus()) {
                    documentHasFocus = true;
                    gameLoop.resume();
                }
            }, 600);
        }

        function onRun (delayMilli, delaySeconds) {

            skyler.update(delaySeconds, Platform.Platforms);

            if (skyler.position.Y < 60) {
                gameLoop.stop();
                $('#abyss').show();
                gameOver();
            }

            health.css('width', skyler.health + '%');
            if (skyler.health <= 0) {
                gameLoop.stop();
                $('#died').show();
                gameOver();
            }

            if (skyler.health <= 75) {
                $('#arm-left-bot').hide();
                $('#arm-left-top').css('fill', '#3e0000');
            }

            if (skyler.health <= 50) {
                $('#arm-right-bot').hide();
                $('#arm-right-top').hide();
            }

            if (skyler.health <= 25) {
                $('#leg-left-bot').hide();
                $('#leg-left-top').css('fill', '#3e0000');
                skyler.speed = 150;
                skyler.decelSpeed = 300;
            }

            Platform.PlatformTop += (3 * delaySeconds);
            platformsContainer.css('top', Platform.PlatformTop + 'px');
        }

        function onStart () {
            playTheme();
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

            pauseTheme();
            log(GameLoop.LogType.INFO, 'Loop State', 'Paused');
        }

        function onResume () {
            playTheme();
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

        function playTheme() {
            if (!$('#muteTheme').hasClass('audio-off')) {
                audio.themeAudio.play();
            }
        }

        function pauseTheme() {
            if (!$('#muteTheme').hasClass('audio-off')) {
                audio.themeAudio.pause();
            }
        }

        function loadAudio() {
            $('#soundEffects audio').each(function (i, e) {
                //e.muted = true; // Mute by default

                let id = $(e).attr('id');

                audio[id] = e;
            });
        }

        $('#muteTheme').on('mousedown', (event) => {
            let control = $(event.currentTarget);
            let target = audio[control.data('target')];

            if (control.hasClass('audio-off')) {
                target.volume = .25;
                target.play();
                control.removeClass('audio-off');
            }
            else {
                target.pause();
                target.currentTime = 0;

                control.addClass('audio-off');
            }
        });

        $('#muteAudio').on('mousedown', (event) => {
            let control = $(event.currentTarget);

            if (control.hasClass('audio-off')) {
                control.removeClass('audio-off');

                // Enable audio
                $('#soundEffects audio').each(function (i, e) {
                    e.muted = false;
                });
            }
            else {
                control.addClass('audio-off');

                // Disable audio
                $('#soundEffects audio').each(function (i, e) {
                    e.muted = true;
                });
            }
        });

        function gameOver() {
            $('#gameOverScreen').removeClass('d-none');

        }
    });
})(jQuery);
