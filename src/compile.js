var Directive = require('./directive');

var compile = function (vm, node) {
    var self = vm;
    //node为元素节点的时候
    if (node.nodeType === 1) {
        // 绑定的v-model,如果是input或者textarea的标签
        if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')) {
            var attrValue = node.getAttribute('v-model');
            self._binding[attrValue]._directives.push(new Directive (
                "input",
                node,
                self,
                attrValue,
                'value'
            ));
            node.addEventListener('keyup', function (e) {
                self.$set(self.$data, attrValue, e.target.value);
            });
            node.removeAttribute('v-model');
        }
        //  绑定的点击事件指令
        if (node.hasAttribute('v-click')) {
            let attrValue = node.getAttribute('v-click');
            let methodName = attrValue; //初始化设置方法名
            /*
             *  /\(.*\)/.exec("num('adf','sdf')");
             *  ["('adf','sdf')"]
             */
            let args = /\(.*\)/.exec(attrValue);
            if (args) {
                let arg = args[0];
                //如果有参数存在的话，需要处理一下得到真正的方法名。
                methodName = attrValue.replace(args, '');
                //处理参数的过程，目前只区分字符串和数字作为参数
                args = arg.replace(/[\(\)]/g, '').split(',');
                args = args.map(function (v) {
                    if (/\'\"/.test(v)) {
                        v = v.toString();
                    } else {
                        v = +v;
                    }
                    return v;
                });
            } else {
                args = [];
            }
            node.addEventListener('click', function () {
                self.$methods[methodName].apply(self.$data, args);
            });
            node.removeAttribute('v-click');
        }
        //手动绑定的方式。就是innerText操作
        if (node.hasAttribute('v-bind')) {
            var attrValue = node.getAttribute('v-bind');
            // 将innerText更新的指令加进去
            self._binding[attrValue]._directives.push(new Directive(
                'text',
                node,
                self,
                attrValue,
                'innerText'
            ));
            node.removeAttribute('v-bind');
        }
        //循环
        if (node.hasAttribute('v-for')) {
            var attrValue = node.getAttribute('v-for');
            // 将innerText更新的指令加进去
            self._binding[attrValue]._directives.push(new Directive(
                'text',
                node,
                self,
                attrValue,
                'innerText'
            ));
            node.removeAttribute('v-for');
        }

    }

    //文本节点
    if (node.nodeType === 3) {
        //(.+?)是非贪婪模式匹配双括号里的结果，以防{{test1}},{{test2}}两个连着的情况出现。
        let reg = /\{\{(.+?)\}\}/g;
        let value = node.nodeValue;
        let ret;
        while (ret = reg.exec(value)) {
            let attrValue = ret[1].trim();
            self._binding[attrValue]._directives.push(new Directive (
                'text',
                node,
                self,
                attrValue,
                'nodeValue'
            ));
        }
    }

};

//用文档片段来劫持dom结构，进行dom解析完后重新渲染
var compileAllNodes = function (node) {
    var vm = this;
    let frag = document.createDocumentFragment();

    let child;
    // 遍历所有的子节点
    while (child = node.firstChild) {
        // 解析下数据了
        compile(vm, child);
        if (child.childNodes.length > 0) {
            vm._compileAllNodes(child);
        }
        frag.appendChild(child);
    }
    node.appendChild(frag);
};

module.exports = compileAllNodes;
