// 主应用模块
const App = {
    isInitialized: false,
    init() {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('应用已经初始化，跳过重复初始化');
            return;
        }

        // 等待DOM加载完成
        $(document).ready(() => {
            // 将语言包和工具函数暴露到全局
            window.i18n = i18n;
            window.LanguageManager = LanguageManager;
            window.Utils = Utils;

            // 等待所有组件加载完成后再初始化
            this.waitForComponents();
        });
    },

    waitForComponents() {
        // 检查关键组件是否已加载
        const checkInterval = setInterval(() => {
            if ($('#sidebar-container').children().length > 0 && 
                $('#header-container').children().length > 0 &&
                $('#json-tool-container').children().length > 0) {
                
                clearInterval(checkInterval);
                this.initializeApp();
            }
        }, 100);

        // 5秒超时保护
        setTimeout(() => {
            clearInterval(checkInterval);
            console.warn('组件加载超时，强制初始化应用');
            this.initializeApp();
        }, 5000);
    },

    initializeApp() {
        // 再次检查是否已经初始化
        if (this.isInitialized) {
            console.log('应用已经初始化，跳过重复初始化');
            return;
        }

        try {
            // 初始化导航
            Navigation.init();

            // 初始化工具
            JsonTool.init(Utils);
            XmlTool.init(Utils);
            TimestampTool.init(Utils);
            Base64Tool.init(Utils);
            UrlTool.init(Utils);
            RegexTool.init(Utils);
            UuidTool.init(Utils);

            // 初始化时间戳工具的当前时间并设置自动刷新
            if (typeof Utils.updateCurrentTimestamp === 'function') {
                Utils.updateCurrentTimestamp();
                setInterval(Utils.updateCurrentTimestamp, 1000); // 每秒钟自动刷新一次时间戳
            }

            // 移除自动点击格式化按钮，避免干扰用户操作
            // 如果需要示例数据，可以直接设置默认值而不触发点击事件
            const defaultJson = '{"name":"DevTools","type":"utility","features":["json","base64","timestamp"],"version":1.0,"active":true,"settings":null}';
            if ($('#json-input').length && !$('#json-input').val()) {
                $('#json-input').val(defaultJson);
            }

            this.isInitialized = true;
            console.log('DevToolBox 应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            // 即使初始化失败也标记为已初始化，避免重复尝试
            this.isInitialized = true;
        }
    }
};

// 启动应用
App.init();