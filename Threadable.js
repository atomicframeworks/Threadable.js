/*
    
       ##    #####      Copyright (c) - Kevin McGinty
     # _ #  ###        
    #   #  #            AtomicFrameworks
    
*/
/*jslint browser: true, plusplus: true*/
/*global Worker, Blob*/
var Threadable = (function () {
    "use strict";
    // Chrome 8/10 prefix URL with webkit
    var createObjectURL = (!window.URL) ? window.webkitURL.createObjectURL : window.URL.createObjectURL,
        // Create an anonymous worker out of func to operate on data and postMessage the return
        AnonymousWorker = function (func, data, imports) {
            var funcStr = '', i = 0, l = imports.length, importRef;
            // Loop through all imports and add to the function string
            while (i < l) {
                // If string assume we are importing a file reference
                if (typeof imports[i] === 'string') {
                    importRef = imports[i];

                    // Check if the resources is an absolute url
                    if (imports[i].substring(0, 7) !== 'http://' && imports[i].substring(0, 8) !== 'https://') {
                        // If the url is not absolute and doesn't start with a slash assume it is relative to the path & not root
                        if (imports[i].substring(0, 1) !== '/') {
                            importRef = window.location.pathname + '/' + importRef;
                        }
                        importRef = window.location.protocol + '//' + window.location.host + importRef;
                    }
                    funcStr += 'importScripts(\'' + importRef + '\');';
                } else if (typeof imports[i] === 'function') {
                    // Else if the import is a function just add it via .toString()
                    funcStr += imports[i] + ';';
                }
                i++;
            }
            // Add self executing function receiving data to function string
            if (typeof func === "function") {
                // Convert function to string & wrap in self executing anonymous function
                if (data !== undefined && data !== null) {
                    funcStr += 'postMessage((' + func.toString() + ')(JSON.parse("' + JSON.stringify(data) + '")));';
                } else {
                    funcStr = 'postMessage((' + func.toString() + ')());';
                }
            }
            return new Worker(
                createObjectURL(new Blob([funcStr], {type: 'text/javascript'}))
            );
        },
        STATES = {
            PENDING: 0,
            RESOLVED: 1,
            REJECTED: 2
        };

    // Worker factory function
    return function (data, maxWorkers) {
        var that = this;
        that.data = data;
        that.processing = 0;
        that.processes = [];
        that.imports = [];
        that.result = undefined;
        that.maxWorkers = maxWorkers;
        that.import = function () {
            var i = 0, l = arguments.length;
            while (i < l) {
                that.imports.push(arguments[i]);
                i++;
            }
            return that;
        };
        // Spawn an anonymous worker and send data to it
        // Return Promise object
        that.spawn = function (func) {
            // Increment processing count on threadable object
            that.processing++;

            return new Promise(function (resolve, reject) {
                // Make sure we have a function
                if (typeof func !== "function") {
                    throw new TypeError(func + " is not a function");
                }
                // Create new worker & process
                var worker = new AnonymousWorker(func, that.data, that.imports),
                    process = {
                        workers: [],
                        processing: 0,
                        processNum: 0,
                        state: STATES.PENDING,
                        result: undefined
                    };
                // Push process to processes array
                that.processes.push(process);

                // Push worker to pool & increment the processing count
                process.workers.push(worker);
                process.processing++;

                worker.onmessage = function (oEvent) {
                    that.result = process.result = oEvent.data;
                    // decrement the processing count
                    process.processing--;

                    // Set process state to resolved
                    process.state = STATES.RESOLVED;

                    // Terminate worker and clear the worker array
                    worker.terminate();
                    process.workers = [];

                    // Update processing on threadable object
                    that.processing--;

                    // Resolve the promise with the data
                    resolve(that.result);

                };
                // Worker error reject with the error message
                worker.onerror = function (e) {
                    // Update processing on threadable object
                    that.processing--;

                    // Set process state to rejected
                    process.state = STATES.REJECTED;

                    reject(new Error(e.data));
                };

            });
        };
        // Spawn multiple workers and map each piece of data using a worker
        // Return Promise Object
        that.map = function (func) {
            // Increment processing count on threadable object
            that.processing++;

            // Return Promise object
            return new Promise(function (resolve, reject) {
                // Make sure we have a function
                if (typeof func !== "function") {
                    throw new TypeError(func + " is not a function");
                }
                var i = 0, l = that.data.length,
                    process = {
                        data: that.data,
                        workers: [],
                        processNum: 0,
                        processing: 0,
                        result: undefined
                    },
                    worker, workersLength, r = [],
                    onMessageScope = function (worker, counter, workersLength) {
                        worker.onmessage = function (oEvent) {
                            r[counter] = oEvent.data;
                            // Decrement the processing count
                            process.processing--;
                            // Terminate and remove the worker
                            worker.terminate();
                            delete process.workers[workersLength];

                            // If no more are processing set the data
                            if (!process.processing && r.length === that.data.length) {
                                that.result = process.result = r;

                                // Clear the worker array of empty workers
                                process.workers = [];
                                // Reset process num
                                process.processNum = undefined;
                                
                                // Update processing on threadable object
                                that.processing--;

                                // Set process state to resolved
                                process.state = STATES.RESOLVED;

                                // Resolve the promise with the data
                                resolve(that.result);

                            } else if (process.processNum < that.data.length && r.length < that.data.length) {
                                // Create new worker and get current length of pool
                                worker = new AnonymousWorker(func, that.data[process.processNum], that.imports);
                                workersLength = process.workers.length;
                                // Scope our variables by sending to onMessageScope
                                onMessageScope(worker, process.processNum);
                                // Push worker to farm pool & increment the processing count
                                process.workers[workersLength] = worker;
                                process.processing++;
                                process.processNum++;
                            }
                        };
                        // Worker error reject with the error message
                        worker.onerror = function (e) {
                            // Update processing on threadable object
                            that.processing--;

                            // Set process state to rejected
                            process.state = STATES.REJECTED;

                            reject(new Error(e.data));
                        };
                    },
                    doWork = function (i) {
                        // Create new worker and get current length of pool
                        worker = new AnonymousWorker(func, that.data[i], that.imports);
                        workersLength = process.workers.length;

                        // Push worker to farm pool & increment the processing count
                        process.workers[workersLength] = worker;
                        process.processing++;
                        process.processNum++;

                        // Scope our variables by sending to onMessageScope
                        onMessageScope(worker, i, workersLength);
                    };
                // Push process to processes
                that.processes.push(process);
                while (i < l) {
                    if (that.maxWorkers && i >= that.maxWorkers) {
                        break;
                    }
                    doWork(i++);
                }
            });
        };
    };
}());