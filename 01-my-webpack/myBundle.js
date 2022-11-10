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

    // console.log('-----moduleInfo-----', moduleInfo)

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
    // console.log('----depsGraph----', depsGraph)

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



// -----------------   生成一个bundle.js文件  --------------------
// (function (graph) {
//     function require(file) {
//         function absRequire(relPath) {
//             return require(graph[file].deps[relPath])
//         }
//         var exports = {};
//         (function (require, exports, code) {
//             eval(code)
//         })(absRequire, exports, graph[file].code)
//         return exports
//     }
//     require('${file}')
// })(${depsGraph})




// ----------- moduleInfo ---- index.js  ---------------------
// {
//     file: './src/index.js',
//     deps: { './add.js': './src\\add.js', './minus.js': './src\\minus.js' },
//     code: '"use strict";\n' +
//       '\n' +
//       'var _add = _interopRequireDefault(require("./add.js"));\n' +
//       'var _minus = require("./minus.js");\n' +
//       'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
//       'var sum = (0, _add["default"])(1, 2);\n' +
//       'var division = (0, _minus.minus)(2, 1);\n' +
//       "console.log('-----求和函数------', sum);\n" +
//       "console.log('----减法----', division);"
// }




// ----------- moduleInfo ---- ./src\\add.js  ---------------------
// {
//     file: './src\\add.js',
//     deps: {},
//     code: '"use strict";\n' +
//       '\n' +
//       'Object.defineProperty(exports, "__esModule", {\n' +
//       '  value: true\n' +
//       '});\n' +
//       'exports["default"] = void 0;\n' +
//       'var _default = function _default(a, b) {\n' +
//       '  return a + b;\n' +
//       '};\n' +
//       'exports["default"] = _default;'
// }



// ----depsGraph---- 
// {
//     "./src/index.js":{
//         "deps":{
//             "./add.js":"./src\\add.js",
//             "./minus.js":"./src\\minus.js"
//         },
//         "code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./add.js\"));\n var _minus = require(\"./minus.js\");\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\nvar sum = (0, _add[\"default\"])(1, 2);\nvar division = (0, _minus.minus)(2, 1);\nconsole.log('-----求和函数------', sum);\nconsole.log('----减法----', division);"},
//      "./src\\add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar _default = function _default(a, b) {\n  return a + b;\n};\nexports[\"default\"] = _default;"},
//      "./src\\minus.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.minus = void 0;\nvar minus = function minus(a, b) {\n  return a - b;\n};\nexports.minus = minus;"
//     }
// }







