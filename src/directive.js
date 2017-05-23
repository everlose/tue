// 指令函数
function Directive (name, el, vm, exp, attr) {
    this.name = name; // 指令名称
    this.el = el; // 指令对应的dom
    this.vm = vm;  // 指令对应的vue实例
    this.exp = exp;  // 指令对应的表达式
    this.attr = attr;  // 绑定的属性值
    //记录上一次的nodeValue值，只为了nodeValue而存在
    this.lastValue = this.attr === 'nodeValue' ? `{{${exp}}}` : null;
    this.update(); // 第一次绑定时调用
};
Directive.prototype.update = function () {
    if (this.attr === 'nodeValue') {
        let value = this.vm.$get(this.vm.$data, this.exp);
        let nodeValue = this.el.nodeValue;
        //为什么用replace，是为了避免`{{test}}, {{test2}}`这样一个文本节点里多个绑定属性的干扰。
        this.el.nodeValue = nodeValue.replace(this.lastValue, value);
        this.lastValue = value;
    } else {
        this.el[this.attr] = this.vm.$get(this.vm.$data, this.exp);
    }
    //this.el[this.attr] = this.$get(this.vm.$data, this.exp);
};

module.exports = Directive;
