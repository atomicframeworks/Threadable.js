# Threadable.js
Spawn worker threads with ease by simply passing in a function. No external files necessary! <br>

## Installation
1. Include the source script in your html <br>
This script will create the Threadable constructor function which can be used to create Threadable objects.
```html
<script src="Threadable.js"></script>
```

## Requirements
Threadable.js requires the environment to support Web Workers, JSON object, URL object, and the Blob constructor.

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
</table><br>


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

## Usage
Call new Threadable(data[, maxWorkers]) to create a new Threadable object. The data will be set as the .data property on the new object. The optional maxWorkers argument it will be set as the .maxWorkers property on the new Threadable object.

Next spawn workers to process the data via the .spawn() or .map() functions on the Threadable object.

Once the workers are done processing the data in the Threadable object the .result property on the object will be updated with the return values.

You can add a callback function to be executed when the Threadable object is done processing by using the .then(callback) function on the object. The callback will receive the results from processing the data.

You can import functions to be added before the processing function using .import().  Note the function must be a named function such as `function works(){}` and not assigned to a variable like `var doesntWork = function(){}`. 

### Examples
The example will iterate through the data array creating a new worker for each element in the array. Each worker will execute the Fibonacci function with the element as the argument.
```js

function fibonacci(n) {
  return n < 2 ? 1 : fib(n - 1) + fib(n - 2);
};

var farm = new WorkerFarm([40, 41, 42]);

farm.map(fib).then(function () {
	console.log(arguments[0]);
});

```

## License 
Threadable.js is released under the MIT license <br>
[www.opensource.org/licenses/MIT](www.opensource.org/licenses/MIT)
