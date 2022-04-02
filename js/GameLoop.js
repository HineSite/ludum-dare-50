export class GameLoop {
    #onRunCallback = null;
    #onStartCallback = null;
    #onStopCallback = null;
    #onPauseCallback = null;
    #onResumeCallback = null;

    #targetFps = 60;
    #loopTimeout = null;
    #logger = null;

    #minimumPrecision = -1;
    #adjustForActualDelay = false; // If the minimum precision is less than the targetFPS, we should adjust for the inconsistent timeout intervals.
    #debugWatch; // Clock measures time from start to finish, including any time paused.
    #loopWatch; // Clock measures time between loop runs. Used to calculate the distance an object must move for the current loop.
    #targetLoopInterval = Math.ceil(1000 / this.#targetFps);
    #loopIterations = 0;
    #loopState = GameLoop.LoopState.STOPPED;
    #pausedCallback = null;
    #pausedInterval = null;

    static LogType = Object.freeze({
        INFO:       Symbol("Info"),
        DEBUG:      Symbol("Debug"),
        WARN:       Symbol("Warning"),
        ERROR:      Symbol("Error")
    });

    static LoopState = Object.freeze({
        STARTING:   Symbol("STARTING"),
        RUNNING:    Symbol("Running"),
        STOPPING:   Symbol("Stopping"),
        STOPPED:    Symbol("Stopped"),
        PAUSING:    Symbol("Pausing"),
        PAUSED:     Symbol("Paused"),
        RESUMING:   Symbol("Resuming")
    });

    constructor(onRun, onStart, onStop, onPause, onResume, targetFps) {
        this.#onRunCallback = onRun;
        this.#onStartCallback = onStart;
        this.#onStopCallback = onStop;
        this.#onPauseCallback = onPause;
        this.#onResumeCallback = onResume;
        this.targetFps = targetFps;
    }

    initialize(onReady) {
        if (typeof onReady !== "function") {
            this.#log(GameLoop.LogType.ERROR, 'Error', 'Invalid onReady function in initialize.');

            return;
        }

        this.testTimestampPrecision((delta) => {
            this.#minimumPrecision = delta;
            if (delta < this.#targetLoopInterval) {
                this.#adjustForActualDelay = true;
            }

            onReady();
        });
    }

    start() {
        if (this.#minimumPrecision < 0) {
            this.#log(GameLoop.LogType.ERROR, 'Error', 'Loop not ready. You must call initialize before starting the loop.');

            return;
        }

        if (typeof this.#onRun !== 'function') {
            this.#log(GameLoop.LogType.ERROR, 'Error', 'Loop cannot run without onRun function.');

            return;
        }

        if (this.#loopState === GameLoop.LoopState.STOPPED) {
            this.#setLoopState(GameLoop.LoopState.STARTING);
        }
        else {
            this.#log(GameLoop.LogType.WARN, 'Warning', 'Unable to start, loop not stopped. Current State: ' + this.#loopState.description);
        }
    }

    stop() {
        if (this.#loopState === GameLoop.LoopState.RUNNING) {
            this.#setLoopState(GameLoop.LoopState.STOPPING);
        }
        else {
            this.#log(GameLoop.LogType.WARN, 'Warning', 'Unable to stop, loop not running. Current State: ' + this.#loopState.description);
        }
    }

    pause(callback, interval) {
        if (this.#loopState === GameLoop.LoopState.RUNNING) {
            this.#pausedCallback = callback;
            this.#pausedInterval = interval;

            this.#setLoopState(GameLoop.LoopState.PAUSING);
        }
        else {
            this.#log(GameLoop.LogType.WARN, 'Warning', 'Unable to pause, loop not running. Current State: ' + this.#loopState.description);
        }
    }

    resume() {
        if (this.#loopState === GameLoop.LoopState.PAUSED) {
            this.#setLoopState(GameLoop.LoopState.RESUMING);
        }
        else {
            this.#log(GameLoop.LogType.WARN, 'Warning', 'Unable to resume, loop not paused. Current State: ' + this.#loopState.description);
        }
    }

    #mainLoop = () => {
        switch (this.#loopState) {
            case GameLoop.LoopState.RESUMING: {
            } // falls through
            case GameLoop.LoopState.STARTING: {
                this.#setLoopState(GameLoop.LoopState.RUNNING);
            } // falls through
            case GameLoop.LoopState.RUNNING: {
                this.#onRun();
                this.#loopTimeout = setTimeout(this.#mainLoop, this.#targetLoopInterval);
                break;
            }

            case GameLoop.LoopState.STOPPING: {
                this.#setLoopState(GameLoop.LoopState.STOPPED);
            } // falls through
            case GameLoop.LoopState.STOPPED: {
                break;
            }

            case GameLoop.LoopState.PAUSING: {
                this.#setLoopState(GameLoop.LoopState.PAUSED);
            } // falls through
            case GameLoop.LoopState.PAUSED: {
                this.#onRun();
                this.#loopTimeout = setTimeout(this.#mainLoop, this.#pausedInterval ?? this.#targetLoopInterval);
                break;
            }
        }
    };

    #onRun() {
        let actualLoopDelay = (performance.now() - this.#loopWatch);
        this.#loopWatch = performance.now();

        this.#log(GameLoop.LogType.DEBUG, 'actualLoopDelay', actualLoopDelay);



        if (this.#loopState ===  GameLoop.LoopState.RUNNING) {
            if (typeof this.#onRunCallback === 'function') {
                let delay = this.#adjustForActualDelay ? actualLoopDelay : this.#targetLoopInterval;
                this.#onRunCallback(delay, (delay / 1000));
            }
        }
        else if (this.#loopState ===  GameLoop.LoopState.PAUSED) {
            if (typeof this.#pausedCallback === 'function') {
                let delay = this.#adjustForActualDelay ? actualLoopDelay : (this.#pausedInterval ?? this.#targetLoopInterval);
                this.#pausedCallback(delay, (delay / 1000));
            }
        }

        if (this.#loopState ===  GameLoop.LoopState.RUNNING)
            this.#loopIterations++;
    }

    #setLoopState(loopState) {
        this.#loopState = loopState;

        switch (this.#loopState) {
            case GameLoop.LoopState.STARTING:
                if (typeof this.#onStartCallback === 'function') {
                    this.#onStartCallback(this.#loopState);
                }

                this.#onStarting();
                break;
            case GameLoop.LoopState.RUNNING:

                break;
            case GameLoop.LoopState.STOPPING:
                if (typeof this.#onStopCallback === 'function') {
                    this.#onStopCallback(this.#loopState);
                }

                this.#onStopping();
                break;
            case GameLoop.LoopState.STOPPED:
                if (typeof this.#onStopCallback === 'function') {
                    this.#onStopCallback(this.#loopState);
                }

                this.#onStopped();
                break;
            case GameLoop.LoopState.PAUSING:
                if (typeof this.#onPauseCallback === 'function') {
                    this.#onPauseCallback(this.#loopState);
                }

                this.#onPausing();
                break;
            case GameLoop.LoopState.PAUSED:
                if (typeof this.#onPauseCallback === 'function') {
                    this.#onPauseCallback(this.#loopState);
                }

                this.#onPaused();
                break;
            case GameLoop.LoopState.RESUMING:
                if (typeof this.#onResumeCallback === 'function') {
                    this.#onResumeCallback(this.#loopState);
                }

                this.#onResuming();
                break;
        }
    }

    #onStarting() {
        if (this.#minimumPrecision > this.#targetLoopInterval) {
            this.#log(GameLoop.LogType.WARN, 'Warning', 'Unable to adjust loop for actual delay. Minimum precision is less than the targetFPS.');
        }

        this.#log(GameLoop.LogType.INFO, 'minimumPrecision', this.#minimumPrecision);
        this.#log(GameLoop.LogType.INFO, 'adjustForActualDelay', this.#adjustForActualDelay);
        this.#log(GameLoop.LogType.INFO, 'targetFps', this.#targetFps);
        this.#log(GameLoop.LogType.INFO, 'targetLoopDelay', this.#targetLoopInterval);

        this.#loopIterations = 0;
        this.#loopWatch = performance.now();
        this.#debugWatch = performance.now();
        this.#loopTimeout = setTimeout(this.#mainLoop, 0);
    }

    #onStopping() {
        clearTimeout(this.#loopTimeout);
    }

    #onStopped() {
        let deltaTime = (performance.now() - this.#debugWatch);

        this.#log(GameLoop.LogType.INFO, 'totalUpdates', this.#loopIterations);
        this.#log(GameLoop.LogType.INFO, 'averageFPS', 1000 / (deltaTime / this.#loopIterations) + '');
        this.#log(GameLoop.LogType.INFO, 'fin', deltaTime + ' ms');
    }

    #onPausing() {

    }

    #onPaused() {

    }

    #onResuming() {
        this.#loopWatch = performance.now();
        this.#loopTimeout = setTimeout(this.#mainLoop, 0);
    }

    testTimestampPrecision(callback) {
        // Naive attempt to determine precision of the timestamp.
        // Set an interval at 0ms, and the first non-zero delta should be the
        //   max precision of the timestamp.
        //
        // 0ms tells the browser to execute the interval as soon and as fast as it can.
        // How quickly this execute depends on the browser and its configuration.
        // Expect a delta between 1 and 100 inclusively.
        //
        // Ideally, we would run this test multiple times and take the average.

        let start = performance.now();
        let testInterval = setInterval(function () {
            let delta = (performance.now() - start);

            if (!isNaN(delta) && delta > 0) {
                callback(delta);

                clearInterval(testInterval);
            }
        }, 0);
    }

    #log(type, title, message) {
        if (this.#logger)
            this.#logger(type, title + ':  ' + message);
    }

    get loopState() {
        return this.#loopState;
    }

    get minimumPrecision() {
        return this.#minimumPrecision;
    }

    set logger(logger) {
        if (typeof logger === 'function') {
            this.#logger = logger;
        }
    }

    get targetFps() {
        return this.#targetFps;
    }

    set targetFps(targetFps) {
        if (!isNaN(targetFps) && targetFps > 0)
            this.#targetFps = targetFps;
    }
}
