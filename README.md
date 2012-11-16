#### css3 选择器获取

根据一个元素，获取能找到该元素的css3 选择器

把js引入到页面中
js只提供一个方法， getCSS3Selector
通过调用window.getCSS3Selector(el)，返回selector字符串 ，类似于"div#content li.nav img" 这种选择器
即，通过jQuery(selector)[0] 或者document.querySelectorAll(selector)[0] 返回el.

获取结果的特点：
足够准确和精炼！！
获取的选择器结果，内部进行了优化，不会出现类似xpath这种特别长的选择器。 
也不会出现 "div div a span"这种超级低效的选择器。
更不会出现"#firstid #secondid .cls img" 这种明显包含无用选择符的选择器
更更不会....

总之：拿到的选择器是更加”前端“一点的，和

使用场景：
此产品是2011年，参加公司比赛，为测试团队编写页面自动化工具，从中提取出来的方法。
还没想到其他使用场景