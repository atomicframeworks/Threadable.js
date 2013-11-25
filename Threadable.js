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
                    if (imports[i].substring(0, 7) !== 'http://' && imports[i].substring(0, 8) !== 'https://' ) {
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
        };

    // Worker Farm Factory
    return function (data, maxWorkers) {
        var that = this;
        that.data = data;
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
        that.errorReceiver = function (e){
            throw e.data;
        };
        // Spawn an anonymous worker and return that for chaining
        that.spawn = function (func) {
            // Make sure we have a function
            if (typeof func !== "function") {
                throw new TypeError(func + " is not a function");
            }
            // Create new worker & process
            var worker = new AnonymousWorker(func, that.data, that.imports),
                process = {
                    workers: [],
                    processing: 0,
                    result: undefined
                };
            // Push process to processes array
            that.processes.push(process);

            // Push worker to farm pool & increment the processing count
            process.workers.push(worker);
            process.processing++;

            worker.onmessage = function (oEvent) {
                that.result = process.result = oEvent.data;
                // decrement the processing count
                process.processing--;

                // If callback for then execute on message
                if (that.thenCallback) {
                    that.thenCallback(process.result);
                }

                // Terminate worker and clear the worker array
                worker.terminate();
                process.workers = [];
            };
            worker.onerror = that.errorReceiver;

            // Return Farm object for chaining
            return that;
        };
        // Set a callback to the thenCallback property and return that for chaining
        that.then = function (func) {
            if (typeof func !== "function") {
                throw new TypeError(func + " is not a function");
            }
            // Set the callback to the object
            that.thenCallback = func;
            // Return Farm object for chaining
            return that;
        };
        that.map = function (func) {
            // Make sure we have a function
            if (typeof func !== "function") {
                throw new TypeError(func + " is not a function");
            }
            var i = 0, l = that.data.length,
                process = {
                    workers: [],
                    dataNum: 0,
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
                            // If callback for then execute on message
                            if (that.thenCallback) {
                                that.thenCallback(process.result);
                            }
                            // Clear the worker array of empty workers
                            process.workers = [];
                        } else if (process.dataNum < that.data.length && r.length < that.data.length) {
                            // Create new worker and get current length of pool
                            worker = new AnonymousWorker(func, that.data[process.dataNum], that.imports);
                            workersLength = process.workers.length;
                            // Scope our variables by sending to onMessageScope
                            onMessageScope(worker, process.dataNum);
                            // Push worker to farm pool & increment the processing count
                            process.workers[workersLength] = worker;
                            process.processing++;
                            process.dataNum++;
                        }
                    };
                    worker.onerror = that.errorReceiver;
                },
                doWork = function (i) {
                    // Create new worker and get current length of pool
                    worker = new AnonymousWorker(func, that.data[i], that.imports);
                    workersLength = process.workers.length;

                    // Push worker to farm pool & increment the processing count
                    process.workers[workersLength] = worker;
                    process.processing++;
                    process.dataNum++;

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
            // Return Farm object for chaining
            return that;
        };
    };
}());