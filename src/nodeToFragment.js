var Watcher = require('./watcher');

//判断每个节点是不是有子节点，如果有那么就返回
const hasChildNode = (node) => {
    return node.childNodes.length === 0 ? false : node;
}

//用文档片段来劫持dom结构，进行dom解析完后重新渲染
const nodeToFragment = (node, vm) => {
    let frag = document.createDocumentFragment();

    let child;
    // 遍历所有的子节点
    while (child = node.firstChild) {
        // 解析下数据了
        compile(child, vm);
        if (hasChildNode(child)) {
            nodeToFragment(child, vm);
        }
        frag.appendChild(child);
    }
    node.appendChild(frag);
}
//初始化编译数据
const compile = (node, vm) => {
    //node为元素节点的时候
    if (node.nodeType === 1) {
        //获取处元素节点上所有属性主要是为了获得v-model
        var attrs = node.attributes;
        for (let i = 0; i < attrs.length; ++i) {
            if (attrs[i].nodeName === 'v-model') {
                var name = attrs[i].nodeValue;
                if (node.nodeName === 'INPUT') {
                    node.addEventListener('keyup', (e) => {
                        vm[name] = e.target.value;
                    });
                }
                node.value = vm[name];
                node.removeAttribute(attrs[i].nodeName);
            }
        }
    }
    //文本节点
    if (node.nodeType === 3) {
        let reg = /\{\{(.*)\}\}/g;
        let value = node.nodeValue;
        let ret;
        while (ret = reg.exec(value)) {
            let name = ret[1].trim();
            new Watcher(vm, node, name);
        }
    }
}

//渲染解析DOM的函数
module.exports = nodeToFragment;
