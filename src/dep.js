//通知者(发布者)，为了通知订阅了data中的属性的地方其值发生了改变
function Dep () {
    //所与之联系的订阅者数组
    this.subs = [];
    //理解成全局变量，由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除。
    this.target = null;
}
Dep.prototype = {
    addSub (watcher) {
        this.subs.push(watcher);
    },
    notify () {
        this.subs.forEach((watcher) => {
            watcher.update();
        });
    }
};

module.exports = Dep;
