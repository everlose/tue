//通知者(发布者)，为了通知订阅了data中的属性的地方其值发生了改变
function Dep () {
    //所与之联系的订阅者数组
    this.subs = [];
    //为了方便getter的时候塞入subs里
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
