// 入口文件


// 引进 less文件
require("./test.less");

const index2Obj = require("./index2.js");
alert("index文件告诉你：小伙子很帅"  );
alert("index2文件告诉你：" + index2Obj.value );

console.log('-----  入口文件打印  -------')

module.exports = {}