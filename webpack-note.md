













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

















 webpack会在各个生命周期中广播事件，并触发对应的插件 





![生命周期](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/646064b458ec44128d627405246863ef~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.image)







##  loader





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

















































































































