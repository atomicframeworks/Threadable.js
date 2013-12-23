# Threadable.js
A Promise based way to create anonymous Web Workers. No external worker files necessary! <br>

## Installation
1. Include the source script in your html <br>
This script will create the Threadable constructor function which can be used to create Threadable objects.
```html
<script src="Threadable.js"></script>
```

## Usage
Call new Threadable(data[, maxWorkers]) to create a new Threadable object. The data will be set as the .data property on the new object. The optional maxWorkers argument will be set as the .maxWorkers property on the new Threadable object.

Next spawn workers to process the data via the .spawn() or .map() functions on the Threadable object.

The .spawn() and .map() functions both return Promises that allow you to chain .then() and .catch() methods to be executed when the workers have completed processing the data or have an error.

Once the workers are done processing the data in the Threadable object the .result property on the object will be updated with the return values. If you have added a .then() callback via the promise the callback be executed and passed the results from the worker.

You can import functions to be added before the processing function using .import().  Note functions must be a named functions such as `function works(){}` and not assigned to a variable like `var doesntWork = function(){}`. 

Each time .map() or .spawn() is called on the threadable object it will push a new process object to the .processes array attribute.  This allows you to execute the worker function multiple times and collect the results in the processes array object. 

The threadable object contains a .processing attribute that is a counter. The count is incremented each time for each new .map() or .spawn() process.  

When the .map() or .spawn() processes have completed they will decrement the processing count attribute. This way you can call .map() or .spawn() multiple times and keep track of how many are still waiting to be returned.

The process objects contain references to the spawned workers as the .workers attribute. When the worker is finished processing and released it will be removed from this array.

The process objects also contain a .state property to represent if their promise is pending: 0, resolved: 1, or rejected: 2.

### Examples
The example will iterate through the data array creating a new worker for each element in the array. Each worker will execute the Fibonacci function with the element as the argument.
```js

function fibonacci(n) {
  return n < 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
};


var threadable = new Threadable([40, 41, 42]);

threadable.map(fibonacci).then(function () {
	console.log(arguments[0]);
});

```

## Requirements
Threadable.js requires the browser environment to support Promises, Web Workers, JSON object, URL object, and the Blob constructor.

[Promises](https://developer.mozilla.org/en-US/docs/Web/API/Promise#Browser_compatibility)

Promises are currently an experimental technology and can be [polyfilled](https://github.com/jakearchibald/ES6-Promises/blob/master/README.md).

<table>
    <tr>
        <th>
            
        </th>
        <th>
            Chrome
        </th>
        <th>
            Firefox (Gecko)
        </th>
        <th>
            Internet Explorer
        </th>
        <th>
            Opera
        </th>
        <th>
            Safari (WebKit)
        </th>
    </tr>
    <tr>
        <th>
            Version
        </th>
        <th>
            32+
        </th>
        <th>
            25.0
        </th>
        <th>
            Not supported
        </th>
        <th>
            Not supported
        </th>
        <th>
            Not supported
        </th>
    </tr>
</table>

<br>

[Web Workers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers#Browser_Compatibility)

<table>
    <tr>
        <th>
            
        </th>
        <th>
            Chrome
        </th>
        <th>
            Firefox (Gecko)
        </th>
        <th>
            Internet Explorer
        </th>
        <th>
            Opera
        </th>
        <th>
            Safari (WebKit)
        </th>
    </tr>
    <tr>
        <th>
            Version
        </th>
        <th>
            3+
        </th>
        <th>
            3.5+ (1.9.1+)
        </th>
        <th>
            10+
        </th>
        <th>
            10.60+
        </th>
        <th>
            6+
        </th>
    </tr>
</table>

<br>

[JSON Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Browser_compatibility)

<table>
    <tr>
        <th>
            
        </th>
        <th>
            Chrome
        </th>
        <th>
            Firefox (Gecko)
        </th>
        <th>
            Internet Explorer
        </th>
        <th>
            Opera
        </th>
        <th>
            Safari (WebKit)
        </th>
    </tr>
    <tr>
        <th>
            Version
        </th>
        <th>
            8+
        </th>
        <th>
            4+
        </th>
        <th>
            10+
        </th>
        <th>
            15+
        </th>
        <th>
            6+
        </th>
    </tr>
</table>

<br>

[URL Object](https://developer.mozilla.org/en-US/docs/Web/API/URL#Browser_compatibility)

<table>
    <tr>
        <th>
            
        </th>
        <th>
            Chrome
        </th>
        <th>
            Firefox (Gecko)
        </th>
        <th>
            Internet Explorer
        </th>
        <th>
            Opera
        </th>
        <th>
            Safari (WebKit)
        </th>
    </tr>
    <tr>
        <th>
            Version
        </th>
        <th>
            8+
        </th>
        <th>
            4+
        </th>
        <th>
            10+
        </th>
        <th>
            15+
        </th>
        <th>
            6+
        </th>
    </tr>
</table>

<br>

[Blob Constructor](https://developer.mozilla.org/en-US/docs/Web/API/Blob#Browser_compatibility)

<table>
    <tr>
        <th>
            
        </th>
        <th>
            Chrome
        </th>
        <th>
            Firefox (Gecko)
        </th>
        <th>
            Internet Explorer
        </th>
        <th>
            Opera
        </th>
        <th>
            Safari (WebKit)
        </th>
    </tr>
    <tr>
        <th>
            Version
        </th>
        <th>
            5+
        </th>
        <th>
            4+
        </th>
        <th>
            10+
        </th>
        <th>
            11.10+
        </th>
        <th>
            5.1+
        </th>
    </tr>
</table>

## License 
Threadable.js is released under the MIT license <br>
[www.opensource.org/licenses/MIT](www.opensource.org/licenses/MIT)
