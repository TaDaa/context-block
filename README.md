

# context-block
Contextualized promise blocks by name and symbol.  Supports async, promises, generators, and manual reject/resolve.
<div>
<a href="#what">What/Why</a><br>
<a href="#install">Install</a><br>
<a href="#api">API Reference</a>
</div>
<br>

<div id="what">

### What/Why?
context-block is intended to assist in managing promises and asynchronous behaviors. 

Imagine you want to update a UI based on the result of a service request - or multiple service requests without blocking
user input. Maybe you are writing server logic and you want to ensure that you avoid sending multiple of database lookups simultaneously.

Context-block provides a developer friendly syntax that will ensure multiple of the same asynchronous activities are not occurring.

</div>
<br>

<div id="install">

###Install
````
npm install --save-dev context-block
````
</div<

<br>
<br>
<div id="api" >

### API Reference
* <a href="#block">Block<a>
* <a href="#block">Context<a>
* <a href="#block">ReverseContext<a>


<br>
<div id="block" >
  
 - <a href="#block">#<b>Block</b></a>
 

	Blocks are segments of code associated with a name. Blocks can either be Forward or Reverse.  Forward      blocks ALWAYS execute the latest code segment.  Reverse blocks only execute the latest code segment if one is not already scheduled to run.
  
	<br>Blocks return <a href="#context">Contexts</a> or <a href="#reverse">ReverseContexts</a> (which extend Promise) and associate the behavior of an asynchronous action with a "name."  A name can be either string or symbol, allowing asynchronous behaviors to be managed
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
</table>


Examples coming soon!
</div>

<p id="context" >


- #### <a href="">#</a> Context <i>extends Promise</i>

	Contexts are the returned value from a <a href="#block">Block</a> and are not intended to be constructed directly. 
Contexts extend from promises and integrate Promise functionality such as Promise.all, Promise.race and much more!  

	The premise behind Contexts are that multiple contexts can potentially exist for a given named block.  However, each context decides how to act in the event multiple Contexts of the same name are created.  Context actions include:
	* <b>dismiss</b><br>  Rejects if another Context of the same name is created<br><br>
	* <b>stop</b><br>  Does not resolve or reject if another Context of the same is created<br><br>
	* <b>join</b>  Resolves or rejects with the latest result<br><br>

	Examples coming soon!
</p>
<br>
<br>

<div id="reversecontext" >

- #### <a href="#">#</a> ReverseContext <i>extends Context</i>

	ReverseContexts take Contexts a step further by deciding the action if a Block already exists.

	ReverseContexts work under the premise
that priority lies with an earlier Context, which naturally changes the meaning of dismiss, stop, and join:
<br>
	* <b>dismiss</b><br>
Rejects if another Context of the same name is already active
<br><br>
	* <b>stop</b><br>
Does not resolve or reject if another Context of the same name is already active<br><br>
	* <b>join</b><br>
Resolves or rejects with the result of an already active Context.  Additionally can resolve or reject with a later Context's result.<br><br>

	Examples coming soon!
	</div>
