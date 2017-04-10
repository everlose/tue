var Dep = require('./dep');

//订阅者（为每个节点的数据建立watcher 队列，每次接受更改数据需求哈后，利用数据劫持执行对应的节点的数据更新操作）
function Watcher(vm, node, name){
    Dep.target = this;
    this.vm = vm;
    this.node = node;
    this.name = name;
    this.update();
    Dep.target = null;
}
Watcher.prototype = {
    update () {
        this.get();
        if (this.node.nodeName === 'INPUT') {
            this.node.value = this.value;
        } else {
            this.node.nodeValue = this.value;
        }
    },
    get () {
        //这里访问了vm的属性，触发了getter，赋予了Dep.target值
        this.value = this.vm[this.name];
    }
};

module.exports = Watcher;
