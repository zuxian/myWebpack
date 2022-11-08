const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core')
const getModuleInfo = (file)=>{
    const body = fs.readFileSync(file,'utf-8')

    // babel/parser包----转AST
    const ast = parser.parse(body,{
        sourceType:'module' //表示我们要解析的是ES模块
    });
    const deps = {}

    // console.log('-----ast-----', ast)
    // console.log(ast.program.body)

    // babel/traverse包----遍历AST收集依赖
    traverse(ast,{
        ImportDeclaration({node}){
            const dirname = path.dirname(file)
            const abspath = "./" + path.join(dirname,node.source.value)
            deps[node.source.value] = abspath
        }
    })

    // es6转ES5--->const转化成var
    const {code} = babel.transformFromAst(ast,null,{
        presets:["@babel/preset-env"]
    })

    // 该模块的路径（file）、依赖（deps）、转化成es5的代码
    const moduleInfo = {file,deps,code}

    console.log('-----moduleInfo-----', moduleInfo)

    return moduleInfo
}



// 递归所有模块  ./src/index.js  ==>  ./src\\add.js    ./src\\add.js

// 首先传入主模块路径，将获得的模块信息放到temp数组里。
// 外面的循坏遍历temp数组，此时的temp数组只有主模块，里面再获得主模块的依赖deps
// 遍历deps，通过调用getModuleInfo将获得的依赖模块信息push到temp数组里。
const parseModules = (file) =>{
    const entry =  getModuleInfo(file)
    const temp = [entry]
    const depsGraph = {}
    for (let i = 0;i<temp.length;i++){
        const deps = temp[i].deps
        if (deps){
            for (const key in deps){
                if (deps.hasOwnProperty(key)){
                    temp.push(getModuleInfo(deps[key]))
                }
            }
        }
    }
    temp.forEach(moduleInfo=>{
        depsGraph[moduleInfo.file] = {
            deps:moduleInfo.deps,
            code:moduleInfo.code
        }
    })
    return depsGraph
}

// 生成一个bundle.js文件-----》 把index.js的内容和它的依赖模块整合起来
const bundle = (file) =>{
    const depsGraph = JSON.stringify(parseModules(file))

    //  递归： 相对路径转化成绝对路径
    return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {};
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`

}
const content = bundle('./src/index.js')

// console.log(content);

//写入到我们的dist目录下
fs.mkdirSync('./dist');
fs.writeFileSync('./dist/bundle.js',content)




// ----------- index.js  ---------------------
// "use strict"
// var _add = _interopRequireDefault(require("./add.js"));
// var _minus = require("./minus.js");
// function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
// var sum = (0, _add["default"])(1, 2);
// var division = (0, _minus.minus)(2, 1);
// console.log(sum); console.log(division);



// ----------------- add.js --------------------
// "use strict";
// Object.defineProperty(exports, "__esModule", {  value: true});
// exports["default"] = void 0;
// var _default = function _default(a, b) {  return a + b;};
// exports["default"] = _default;


