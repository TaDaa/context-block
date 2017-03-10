

#context-block
Contextualized promise blocks by name and symbol.  Supports async, promises, generators, and manual reject/resolve.
<div>
<a href="#what">What/Why</a><br>
<a href="#install">Install</a><br>
<a href="#api">API Reference</a>
<a href="#examples">Examples</a>
</div>
<br>

----------------------


<div id="what"></div>

###What/Why?
context-block is intended to assist in managing promises and asynchronous behaviors. 

Imagine you want to update a UI based on the result of a service request - or multiple service requests without blocking
user input. Maybe you are writing server logic and you want to ensure that you avoid sending multiple of database lookups simultaneously.

Context-block provides a developer friendly syntax that will ensure multiple of the same asynchronous activities are not occurring.

<br>

----------------------


<div id="install"></div>

###Install
````
npm install --save-dev context-block
````


<br>

----------------------

<div id="api" ></div>


### API Reference
* <a href="#block">Block<a>
* <a href="#block">Context<a>
* <a href="#block">ReverseContext<a>


<br>
<div id="block" ></div>
  
 - #### <a href="">#</a> <b>Block</b></a>
 

	Blocks are segments of code associated with a name. Blocks can either be Forward or Reverse.  Forward      blocks ALWAYS execute the latest code segment.  Reverse blocks only execute the latest code segment if one is not already scheduled to run.
  
	<br>Blocks return <a href="#context">Contexts</a> or <a href="#reverse">ReverseContexts</a> (which extend Promise) and associate the behavior of an asynchronous action with a <a href="#name">name</a>.  A <a href="#name">name</a> can be either string or symbol, allowing asynchronous behaviors to be managed
at various hierarchies (component vs global levels).  Blocks also support a tagged literal format to help differentiate Blocks from other code (<a href="#ex-tagged-literal">example</a>)

	<br>There are three forward and reverse block behavior functions defined.  <br>
	* <b>block.dismiss(<a href="#name">name</a>[,<a href="#fn">fn</a>,<a href="#delay">delay</a>])</b> <br> 	Returns a <a href="#context">Context</a> for <a href="#name">name</a> and executes <a href="#fn">fn</a>.  If another block of the same <a href="#name">name</a> is created, the returned <a href="#context">Context</a> will be dismissed (rejected).<br><br>
	* <b>block.stop(<a href="#name">name</a>[,<a href="#fn">fn</a>,<a href="#delay">delay</a>])</b><br>Returns a <a href="#context">Context</a> for <a href="#name">name</a> and executes <a href="#fn">fn</a>.  If another block of the same <a href="#name">name</a> is created, the returned <a href="#context">Context</a> will NOT be resolved or rejected.<br><br>
	* <b>block.join(<a href="#name">name</a>[,<a href="#fn">fn</a>,<a href="#delay">delay</a>])</b> <br>Returns a <a href="#context">Context</a> for <a href="#name">name</a> and executes <a href="#fn">fn</a>.  If another block of the same <a href="#name">name</a> is created, the returned <a href="#context">Context</a> will resolve/reject with the result of the new block.<br><br>
	* <b>block.reverse.dismiss(<a href="#name">name</a>[,<a href="#fn">fn</a>,<a href="#delay">delay</a>])</b><br>Returns a <a href="#reverse">ReverseContext</a> for <a href="#name">name</a> and only executes <a href="#fn">fn</a> if another block of the same  <a href="#name">name</a>  is not already scheduled to activate.  If another block already exists, the returned <a href="#reverse">ReverseContext</a> will be automatically dismissed.<br><br>
	* <b>block.reverse.stop(<a href="#name">name</a>[,<a href="#fn">fn</a>,<a href="#delay">delay</a>])</b><br>Returns a <a href="#reverse">ReverseContext</a> for <a href="#name">name</a> and only executes <a href="#fn">fn</a> if another block of the same  <a href="#name">name</a>  is not already scheduled to activate.  If another block already exists, the returned <a href="#reverse">ReverseContext</a> will not resolve or reject<br><br>
	* <b>block.reverse.join(<a href="#name">name</a>[,<a href="#fn">fn</a>,<a href="#delay">delay</a>])</b><br>Returns a <a href="#reverse">ReverseContext</a> for <a href="#name">name</a> and only executes <a href="#fn">fn</a> if another block of the same <a href="#name">name</a> is not already scheduled to activate.  If another block already exists, the returned <a href="#reverse">ReverseContext</a> will resolve or reject with the result of the existing block.  Additionally, if a block of the same <a href="#name">name</a> is created, the returned <a href="#reverse">ReverseContext</a> will resolve/reject with the result of the new block  <br><br>

	Blocks accept the following arguments:
	<br>
		<table >
<tr><td id="#name">name</td><td>required</td><td >Names are symbols or strings used to bind a single function that resolves or rejects associated contexts.  Contexts define their behavior when a naming collision occurs.  After a context resolves, rejects, or stops, the name will become free again.</td></tr>
<tr><td id="#fn">fn</td><td >optional</td><td>function that will be called.  "fn" can either be a promise (<a href="#ex-promise">example</a>),  a function with ({reject,resolve}) arguments (<a href="#ex-detect">example</a>), return a promise (<a href="#ex-ret-promise">example</a>), async/await (<a href="#ex-async">example</a>), or a generator (<a href="#ex-generator">example</a>).  A Forward Block will always call "fn".  Reverse blocks only call "fn" if the name is not already in use.
</td></tr>
<tr><td>delay</td><td >optional</td><td >time(ms) to wait before invoking "fn"</td></tr>
</table><br>

	Examples coming soon!
<br>
<br>

----------------------

<div id="context" ></div>


- #### <a href="">#</a> Context <i>extends Promise</i>

	Contexts are the returned value from a <a href="#block">Block</a> and are not intended to be constructed directly. 
Contexts extend from promises and integrate Promise functionality such as Promise.all, Promise.race and much more!  

	The premise behind Contexts are that multiple contexts can potentially exist for a given <a href="#block">Block</a> <a href="#name">name</a>.  However, each context decides how to act in the event multiple Contexts of the same name are created.  Context actions include:
	* <b>dismiss</b><br>  Rejects if another Context of the same <a href="#name">name</a> is created<br><br>
	* <b>stop</b><br>  Does not resolve or reject if another Context of the same <a href="#name">name</a> is created<br><br>
	* <b>join</b>  Resolves or rejects with the latest result<br><br>

----------------------
<br>
<br>

<div id="reversecontext" ></div>

- #### <a href="#">#</a> ReverseContext <i>extends Context</i>

	ReverseContexts take <a href="#context">Contexts</a> a step further by deciding the action if a <a href="#block">Block</a> already exists.

	ReverseContexts work under the premise
that priority lies with an earlier <a href="#context">Context</a>, which naturally changes the meaning of dismiss, stop, and join:
<br>
	* <b>dismiss</b><br>
Rejects if another <a href="#context">Context<a> of the same <a href="#name">name</a> is already active
<br><br>
	* <b>stop</b><br>
Does not resolve or reject if another <a href="#context">Context<a> of the same <a href="#name">name</a> is already active<br><br>
	* <b>join</b><br>
Resolves or rejects with the result of an already active <a href="#context">Context</a>.  Additionally can resolve or reject with a later Context's result.<br><br>

----------------------
<br>
<br>
<div id="examples"></div>

###Examples

<div id="ex-tagged-literal"></div>
####Tagged Literal (dismiss)
````
const block = require('context-block');

//tagged literal block with unspecified dismiss,stop,join defaults to dismiss.
block `test` (({reject,resolve})=>{
	//never called
}).then(()=>{
	//never called
}).catch((v)=>{
	console.error(v); // "dismissed"
});

//tagged literal block with specified method
//context will be dismissed as another context will activate with the same name
block.dismiss `test` (()=>{
	return new Promise((resolve,reject)=>{
		resolve('hello world');
	});
}).catch ((v)=>{
	console.error(v); //v is "dismissed"
}); 

//untagged equivalents for reference
//another context of the same is defined again, so nothing nothing will get called
block.stop('test',({reject,resolve})=> {
	//never called
}).catch((v)=>{
    	//never called
});

//join context will result in "world" because the last context resolves "world"
block('test').join(({reject,resolve})=>{
	resolve('hello');
}).then((v)=>{
    	console.error(v); //v is "world"
});

block.join `test` (({reject,resolve})=>{
	resolve('world');
}).then((v)=>{
    	console.error(v); //v is "world"
});

OUTPUT:
dismissed
dismissed
world
world
````

<div id="ex-promise"></div>
####fn is a promise
````
block.dismiss `test` (new Promise((resolve,reject)=>{
	resolve('hi');
})).then((v)=>{
	console.error(v); //v is "hi"
});


OUTPUT:
hi
````


<div id="ex-detect"></div>
####fn synchronously references resolve/reject arguments
````
//note the es6 destructure syntax
//<b>if you specify resolve, reject arguments, you must resolve the context using them!!!</b>
block `test` (({resolve,reject})=>{
	resolve(1);
}).then((v)=>{
	console.error(v); //v is 1
});

OUTPUT:
1

````


<div id="ex-ret-promise"></div>
####fn returns a promise
````
block `test` (()=>{
	return new Promise((resolve,reject)=>{
		resolve(2);
	});
}).then((v)=>{
	console.error(v); //v is 2
});

OUTPUT:
1

````



<div id="ex-async"></div>
####fn uses async/await
````
async function getSomething () {
	return new Promise((resolve,reject)=>{
		resolve('banana');
	});
}
block `test` (async ()=>{
	return await getSomething('for my monkey');
}).then((v)=>{
	console.error(v); //v is "banana"
});

OUTPUT:
banana

````



<div id="ex-generator"></div>
####fn is a generator (behaves as a coroutine)
````

block `test` (function * () {
	yield new Promise((resolve,reject)=>{
		setTimeout(()=>resolve(1),20)
	});
	yield 2;
	yield new Promise((resolve,reject)=>{
		resolve(3);
	});
	return 4
}).then((v)=>{
	console.error(v); //v is [1,2,3,4]
});

OUTPUT:
1,2,3,4

````





<div id="ex-integrate"></div>
####Contexts integrate with promise functionalities (Promise.all & Promise.race)
````
Promise.all([
	block `test1` (({resolve,reject})=>{resolve(1);}),
	block `test2` (({resolve,reject})=>{resolve(2);})
]).then((v)=>{
	console.log(v);
});


OUTPUT:
1,2
````
````
Promise.race([
	block `test1` (({resolve,reject})=>{resolve(1);}),
	block `test2` (({resolve,reject})=>{setTimeout(()=>resolve(2));})
]).then((v)=>{
	console.log(v);
});


OUTPUT:
1

````
