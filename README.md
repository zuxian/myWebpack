##  前期知识







![生命周期](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/646064b458ec44128d627405246863ef~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)







####  手写loader



同步写法:   使用this.callback()或者直接return输出; this.callback的好处在于可以传递更多的内容参数 

```js
module.exports = function (content, map, meta) {
  const output = someSyncOperation(content);

  // return output;
  this.callback(null, output, map, meta);
  return;
};
```

异步写法： 通过this.async()获取回调方法 

```js
module.exports = function (content, map, meta) {
  const callback = this.async();

  someAsyncOperation(content, function (err, result, sourceMaps, meta) {
    if (err) return callback(err);
    callback(null, result, sourceMaps, meta);
  });
};
```









####  手写plugin











####  AST语法树









####  tapable事件流

Webpack要经过一系列处理流程后将源文件转换成输出。 每个流程作用单一，多个流程之间存在依赖关系，只有完成当前处理后才能交给下一个流程去处理。

Webpack 在运行过程中会广播事件，插件只需要监听它所关心的事件，就能加入到这条生产线中，去改变生产线的运作。 Webpack 的事件流机制保证了插件的有序性，使得整个系统扩展性很好。

Tapable提供了很多类型的hook，分为同步和异步两大类(异步中又区分异步并行和异步串行)，根据事件执行的终止条件的不同，衍生出 Bail/Waterfall/Loop 类型。

![tapable](https://raw.githubusercontent.com/wzx365/min-webpack/master/images/Tapable.png)

| 名称              | 解释                                                         |
| ----------------- | ------------------------------------------------------------ |
| SyncHook          | 同步执行，无需返回值                                         |
| SyncBailHook      | 同步执行，无需返回值，返回undefined终止                      |
| SyncWaterfallHook | 同步执行，上一个处理函数的返回值是下一个的输入，返回undefined终止 |
| SyncLoopHook      | 同步执行， 订阅的处理函数有一个的返回值不是undefined就一直循环 |
| AsyncSeriesHook          | 异步执行，无需返回值                                         |
| AsyncParallelHook        |                                                              |
| AsyncSeriesBailHook      | 异步执行，无需返回值，返回undefined终止                      |
| AsyncSeriesWaterfallHook | 异步执行，上一个处理函数的返回值是下一个的输入，返回undefined终止 |

- ##### SyncHook

有一个tap将任务添加的内部的执行队列中。如果调用call方法，将执行同步执行所有tap过的方法

```js
class SyncHook {
	constructor(args){ this.tasks = [];	}
	call(...args){ this.tasks.forEach((task) => task(...args)) }
	tap(name,task){	this.tasks.push(task); }
}

let hook = new SyncHook(['name']);
hook.tap('plugins_0',function(name){	console.log('plugins_0',name) })
hook.tap('plugins_1',function(name){	console.log('plugins_1',name) })
hook.call('hello word');
```

- ##### AsyncSeriesWaterfallHook

一个tap将任务添加的内部的执行队列中。如果调用call方法，将执行同步执行所有tap过的方法，且需上一个返回值，给下一个函数队列。

```js
class SyncWaterfallHook {
    constructor(args) { this.tasks = [] }
    tap(name, cb) {
        let obj = {}; obj.name = name; obj.cb = cb;
        this.tasks.push(obj)
    }
    call(...arg) {
        let [first, ...others] = this.tasks
        let ret = first.cb(...arg)
        others.reduce((pre, next) => { return next.cb(pre) }, ret)
    }
}
```

Webpack 的事件流机制应用了发布/订阅模式，和 Node.js 中的 EventEmitter 非常相似。 Compiler 和 Compilation 都继承自 Tapable，可以直接在 Compiler 和 Compilation 对象上广播和监听事件。











##  简陋版







需要读到入口文件里面的内容。
分析入口文件，递归的去读取模块所依赖的文件内容，生成AST语法树。
根据AST语法树，生成浏览器能够运行的代码



打包流程：

1. 获取主模块内容

2. 分析模块

3. - 安装@babel/parser包（转AST）

4. 对模块内容进行处理

5. - 安装@babel/traverse包（遍历AST收集依赖）
   - 安装@babel/core和@babel/preset-env包 （es6转ES5）

6. 递归所有模块

7. 生成最终代码














## 进阶版



https://juejin.cn/post/6854573219245441038





































##  参考





![webpack流程](https://raw.githubusercontent.com/wzx365/min-webpack/master/images/webpack%E7%BC%96%E8%AF%91%E4%B8%BB%E6%B5%81%E7%A8%8B.png)





































































































