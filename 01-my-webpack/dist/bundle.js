(function (graph) {
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
        require('./src/index.js')
    })({"./src/index.js":{"deps":{"./add.js":"./src\\add.js","./minus.js":"./src\\minus.js"},"code":"\"use strict\";\n\nvar _add = _interopRequireDefault(require(\"./add.js\"));\nvar _minus = require(\"./minus.js\");\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\nvar sum = (0, _add[\"default\"])(1, 2);\nvar division = (0, _minus.minus)(2, 1);\nconsole.log('-----求和函数------', sum);\nconsole.log('----减法----', division);"},"./src\\add.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nvar _default = function _default(a, b) {\n  return a + b;\n};\nexports[\"default\"] = _default;"},"./src\\minus.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.minus = void 0;\nvar minus = function minus(a, b) {\n  return a - b;\n};\nexports.minus = minus;"}})