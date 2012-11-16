;//get CSS3 selector according to a element
(function (host) {

    var doc = host.document, $ = function(sel){
        return (host.jQuery && host.jQuery(sel)) || (doc.querySelectorAll && doc.querySelectorAll(sel)) || 0;
    };

    /**
     * 获取selector的入口方法. 供外部使用!
     * 两个步骤，首先获取一个由很多选择器组成的selector，然后再多selector进行优化
     * @param el 给定的元素
     * @return {String} e 元素的 selector
     */
    function getCSS3Selector(el) {
        if(typeof $ !== "function"){
            return '';
        }
        var selector = _getFullSelector(el);
        if (selector.split(' ').length <= 3) {
            return selector;
        }
        return _inSureUniqueSelector(_getOptSelector(selector), el);
    }

    /**
     * 再次确定元素是否唯一f
     * 因为有可能 没法唯一确定该元素，必须使用index来确定才可以
     * @private
     */
    function _inSureUniqueSelector(selector, el) {
        var els = $(selector), length = els.length;
        if (length > 1) {
            for (var i = 0; i < length; i++) {
                if (el === els[i]) {
                    return selector + ":eq(" + i + ")"
                }
            }
        }
        return selector;
    }

    function isUniqueSector(selector) {
        return $(selector.join(" ")).length === 1;
    }

    /**
     * optimize a given jquery selector
     * @param selector
     * @return {*} optimized selector
     */
    function _getOptSelector(selector) {
        //eg.  #id .a .b .c .d div = > [#id, .a, .b, ..]
        selector = selector.split(' ');
        var copy_selector = selector.slice(),
            final_selector = [],
            s_selector = [selector[0]],
            e_selector = selector.slice(selector.length - 2, selector.length);
        final_selector = s_selector.concat(e_selector);


        if (isUniqueSector(final_selector)) { //if ele for this selector, then opt is unuseful
            return final_selector.join(' ');
        } else {
            return run(selector.splice(s_selector.length, selector.length - s_selector.length - e_selector.length), function (arr) {
                if (isUniqueSector(s_selector.concat(arr).concat(e_selector))) {
                    final_selector = s_selector.concat(arr).concat(e_selector);
                    return final_selector.join(' ');
                } else {
                    //arguments.callee.sel = [se[0]].concat(arr).concat([se[se.length - 2], se[se.length - 1]]);
                    return false;
                }
            });
        }

        /**
         * 循环向final_selector 中添加选择器来逐步限定范围，直到精确确定唯一的selector 返回
         *    这里递归调用了。
         *   如原始selector 为 a b c d e f g
         *   那么会逐步尝试
         *   a (b) f g
         *   a (c) f g
         *   a (d) f g
         *   ..
         *   a (b c) f g
         *   a (b d) f g
         *   a (b ...) f g
         *   ...
         *   a (b c d) f g
         *   a (b c e) f g
         *   ...
         * @param arr
         * @param fnc
         * @return {String}
         */
        function run(arr, fnc) {
            var length = arr.length, sel = false;
            for (var i = length - 1; i >= 0; i--) {
                var temp = arr.slice();

                if ((sel = fnc.call(this, arr[i])) !== false) {
                    return sel;// 拿到结果，直接返回
                }
                arr = temp.slice();
            }
            if (arr.length === 1) {
                return copy_selector.join(' ');
            }
            e_selector = [arr[arr.length - 1]].concat(e_selector);
            arr.splice(arr.length-1, 1);
            run(arr, fnc);
            return copy_selector.join(' ');
        }
    }

    /**
     * 通常可以获得一个比较精确的selector， 但是会稍微长一点，比如
     * #abc .clsa .clb .cld .d .sdf .sss img
     * get a full selector .
     * @param ele
     * @return {String}
     */
    function _getFullSelector(ele) {
        var s = [], classNode, parentId, parentClass, tagName = ele.tagName.toLowerCase(), tagPName = '';
        if (tagName === 'body' || tagName === 'html') {
            return tagName;
        }
        for (var index = 0; index < 6; index++) {
            tagPName = ele.parentNode && ele.parentNode.tagName.toLowerCase();
            tagName = ele.tagName.toLowerCase();
            if (ele.parentNode && tagPName !== "body" && tagPName !== "html") {
                if (ele.id) {
                    s.push(tagName + "#" + ele.id);
                    return s.reverse().join(' ');
                } else if (ele.className) {
                    s.push(tagName + "."
                        + trim(ele.className).replace(/[ ]{1,}/g, "."));
                } else {
                    if (index != 0) { //first time , a selector must be push
                        index--;
                        ele = ele.parentNode;
                        continue;
                    } else if (tagName == 'input') {
                        s.push(tagName + '[name="' + ele.name + '"]');
                    } else {
                        s.push(tagName);
                    }
                }
                ele = ele.parentNode;
            }
        }
        classNode = ele;
        parentId = getParentsId(ele);
        if (parentId) {
            return parentId + " " + s.reverse().join(' ');
        } else if (parentClass = getParentsClass(classNode)) {
            return parentClass + " " + s.reverse().join(' ');
        } else {
            return s.reverse().join(' ');
        }


        // String trim
        function trim(s) {
            return s.replace(/^\s+|\s+$/g, "");
        }

        /**
         * 从当前节点开始向父节点查找，知道找到一个有id的父节点，到body的还没有的话，返回空
         * @param node
         * @return {String} 有id的父亲节点或者空
         */
        function getParentsId(node) {
            while (node.parentNode
                && node.tagName.toLowerCase() != 'body'
                && node.tagName.toLowerCase() != 'html') {
                if (node.parentNode.id) {
                    return node.parentNode.tagName.toLowerCase() + "#" + node.parentNode.id;
                }
                node = node.parentNode;

            }
            return '';
        }

        /*
         * 从当前节点开始向父节点查找，知道找到一个有class的父节点，到body的还没有的话，返回空
         * @param node
         * @return {String} 有class的父亲节点或者空
         */
        function getParentsClass(node) {
            while (node.parentNode
                && node.tagName.toLowerCase() != 'body'
                && node.tagName.toLowerCase() != 'html') {
                if (node.parentNode.className) {
                    return node.parentNode.tagName.toLowerCase() + "." + trim(node.parentNode.className).replace(/[ ]/g, '.');
                }
                node = node.parentNode;
            }
            return '';
        }
    }
    host.getCSS3Selector = getCSS3Selector;
})(window);