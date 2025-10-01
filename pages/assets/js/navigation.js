// 导航模块
const Navigation = {
    init() {
        // 侧边栏切换
        $('#toggle-sidebar').on('click', function() {
            $('#sidebar').toggleClass('open');
        });

        $('#close-sidebar').on('click', function() {
            $('#sidebar').removeClass('open');
        });

        // 导航项点击事件
        $(document).on('click', '.nav-item', function(e) {
            e.preventDefault();

            // 移除所有导航项的活跃状态
            $('.nav-item').removeClass('nav-item-active active');

            // 添加当前导航项的活跃状态
            $(this).addClass('nav-item-active active');

            // 获取工具类别
            const category = $(this).attr('data-category');
            const toolTitle = $(this).find('span').text();

            // 更新当前工具名称
            $('#current-tool-name').text(toolTitle);

            // 隐藏所有工具，显示当前工具
            $('.tool-section').css('display', 'none');
            $(`#${category}`).css('display', 'block');

            // 在移动设备上点击导航后关闭侧边栏
            if ($(window).width() < 768) {
                $('#sidebar').removeClass('open');
            }
        });

        // 默认激活JSON工具
        $('.nav-item[data-category="json"]').addClass('nav-item-active active');
        $('#current-tool-name').text($('.nav-item[data-category="json"]').find('span').text());

        // 默认显示JSON工具，隐藏其他工具
        $('.tool-section').css('display', 'none');
        $('#json').css('display', 'block');

        // 初始化语言切换
        $('#lang-zh').on('click', () => LanguageManager.changeLanguage('zh'));
        $('#lang-en').on('click', () => LanguageManager.changeLanguage('en'));
    }
};