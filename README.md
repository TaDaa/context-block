# context-block
Contextualized promise blocks by name and symbol.  Supports async, promises, generators, and manual reject/resolve.

####What/Why?
context-block is intended to assist in managing asynchronous behaviors. 

Imagine you want to update a UI based on the result of a service request - or multiple service requests without blocking
user input. Maybe you are writing server logic and you want to ensure that you avoid sending multiple of database lookups simultaneously.

Context-block provides a developer friendly syntax that will ensure only the first, last, or all contexts complete.


####Install
````
npm install --save-dev context-block
````

####API Reference
* require('context-block') - returns Block function, which defaults to block.dismiss


#####Block
Blocks are how you define the behavior for a context associated with "name"

* block (namespace,[fn,delay]) - returns a context for "name" .  If fn is not specified, invoke dismiss, join, or stop. 
````
//these two blocks share the same "test" namespace
block('test',({reject,resolve}) => {
  setTimeout(()=>resolve(1))
}).then((v)=>{
  //never called
}).catch((v)=>{
  console.log(v); //dismissed
});

//alternative tagged literal syntax
block `test` (({reject,resolve}) => {
  setTimeout(()=>resolve(1))
}).then((v)=>{
  console.log(v); //1
}).catch((v)=>{
  //never called
}));

OUTPUT:
dismissed
1
````

* Block.dismiss (namespace, fn[,delay]) - returns a context of type "DISMISS"
* Block.stop (namespace, fn[,delay]) - returns a context of type "STOP"
* Block.join (namespace, fn[,delay]) - returns a context of type "JOIN"
* Block.reverse (namespace, [fn,delay]) - returns a reverse context for "name".  If fn is not specified, invoke dismiss, join, or stop.
* Block.reverse.dismiss | Block.dismiss.reverse (namespace, fn[,delay]) - returns a reverse context of type "DISMISS"
* Block.reverse.stop | Block.stop.reverse (namespace, fn[,delay]) - returns a reverse context of type "STOP"
* Block.reverse.join | Block.join.reverse (namespace, fn[,delay]) - returns a reverse context of type "JOIN"

All block types accept the following arguments:

<table>
<tr><td>namespace</td><td>required</td><td style="font-size:small">Namespaces are symbols or strings used to bind a single function that resolves or rejects associated contexts.  Contexts define their behavior when a namespace collision occurs.  After a context resolves, rejects, or stops, the namespace will become free again.</td></tr>
<tr><td>fn</td><td>optional</td><td>function that will be called.  "fn" supports using ({reject,resolve}) arguments, return a promise, async/await, or executing a generator.  A normal block will always call "fn" and all existing contexts will determine whether
  or not to share the result, stop, or dismiss themselves.  A reverse block "fn" will be called only if the namespace is not already in use and 
  if a namespace is already in use, the reverse context will determine whether or not to share, stop, or dismiss. 
</td></tr>
<tr><td>delay</td><td>optional</td><td>time(ms) to wait before invoking "fn"</td></tr>
</table>

####Context
Contexts extend from promises.  They integrate with Promise.all, Promise.race and much more!  Contexts work under the premise
that the most recently declared promise will activate and its "fn" will be called.  Pre-existing contexts will resolve depending on their context
type (DISMISS, STOP, or JOIN).  

* DISMISS - context will reject with "dismissed" value if another context of the same name is activated
* STOP - context will not resolve or reject if another context of the same is activated
* JOIN - context will resolve or reject with the result of a newer context of the same name

####ReverseContext
Reverse Contexts extend Context and also integrate with promise functionality.  ReverseContexts as their name suggests, work in reverse.
The earliest declared Context will be treated as active.  If a context does not already exist, the ReverseContext will activate
its "fn".  

* DISMISS - context will reject with "dismissed" value if another context of the same name is already active
* STOP - context will not reject or resolve if another context of the same name already exists
* JOIN - context will resolve or reject with the result of a pre-existing context of the same name.  Additionally, if another context of the same 
name is activated, it will share the result with the newer context.



####Examples
Coming soon!
