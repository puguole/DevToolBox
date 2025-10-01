// JSON工具模块
const JsonTool = {
    isInitialized: false,
    init(utils) {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('JSON工具已经初始化，跳过重复初始化');
            return;
        }

        const $input = $('#json-input');
        const $outputTree = $('#json-output-tree');
        const $outputText = $('#json-output-text');
        const $formatBtn = $('#json-format');
        const $validateBtn = $('#json-validate');
        const $exampleBtn = $('#json-example');
        const $copyBtn = $('#json-copy');
        const $clearBtn = $('#json-clear');
        const $viewTreeBtn = $('#json-view-tree');
        const $viewTextBtn = $('#json-view-text');
        const $historyBtn = $('#json-history');
        
        // 防止重复点击的状态管理
        let isProcessing = false;
        const processingTimeout = 3000; // 3秒超时自动恢复
        
        // 存储当前的JSON数据用于复制
        let currentJsonData = null;
        
        // 更新JSON数据的函数
        function updateJsonData(jsonString) {
            currentJsonData = jsonString;
        }
        
        // 恢复按钮状态的通用函数
        function restoreButtonState($button, $icon, originalIcon) {
            $icon.attr('class', originalIcon);
            $button.prop('disabled', false);
            isProcessing = false;
        }
        
        // 处理按钮点击的通用函数
        function handleButtonClick($button, action) {
            if (isProcessing) {
                console.log('操作正在进行中，请稍候...');
                return false;
            }
            
            isProcessing = true;
            const $icon = $button.find('i');
            const originalIcon = $icon.attr('class');
            
            // 显示处理状态
            $icon.attr('class', 'fa fa-spinner fa-spin');
            $button.prop('disabled', true);
            
            // 设置超时自动恢复
            const timeoutId = setTimeout(() => {
                console.warn('操作超时，自动恢复按钮状态');
                restoreButtonState($button, $icon, originalIcon);
            }, processingTimeout);
            
            // 执行实际操作
            setTimeout(() => {
                try {
                    const result = action();
                    
                    // 清除超时定时器
                    clearTimeout(timeoutId);
                    
                    // 恢复按钮状态
                    restoreButtonState($button, $icon, originalIcon);
                } catch (error) {
                    console.error('操作出错:', error);
                    clearTimeout(timeoutId);
                    restoreButtonState($button, $icon, originalIcon);
                }
            }, 50);
            
            return true;
        }

        // 切换到树形视图
        $viewTreeBtn.on('click', function() {
            $outputTree.css('display', 'block');
            $outputText.css('display', 'none');
            $viewTreeBtn.css('backgroundColor', 'rgba(59, 130, 246, 0.1)').css('color', 'var(--primary)');
            $viewTextBtn.css('backgroundColor', '#f3f4f6').css('color', '#374151');
        });

        // 切换到文本视图
        $viewTextBtn.on('click', function() {
            $outputText.css('display', 'block');
            $outputTree.css('display', 'none');
            $viewTextBtn.css('backgroundColor', 'rgba(59, 130, 246, 0.1)').css('color', 'var(--primary)');
            $viewTreeBtn.css('backgroundColor', '#f3f4f6').css('color', '#374151');
        });

        // 格式化JSON
        $formatBtn.on('click', function() {
            handleButtonClick($(this), () => {
                const result = utils.formatJson($input.val());

                if (result.error) {
                    $outputText.html(`<span style="color: var(--danger);">${result.error}</span>`);
                    $outputTree.html(`<span style="color: var(--danger);">${result.error}</span>`);
                    utils.showNotification(LanguageManager.getText('json-format-error'), true);
                } else {
                    $outputText.text(result);
                    utils.renderJsonTree(result, $outputTree);
                    updateJsonData(result); // 保存JSON数据用于复制
                    utils.historyManager.saveHistory('json', $input.val()); // 保存到历史记录
                    utils.showNotification(LanguageManager.getText('json-format-success'));
                }
            });
        });

        // 验证JSON
        $validateBtn.on('click', function() {
            handleButtonClick($(this), () => {
                const validation = utils.validateJson($input.val());

                if (validation.valid) {
                    // 验证成功时，格式化并保存JSON数据
                    const formattedJson = utils.formatJson($input.val());
                    if (typeof formattedJson === 'string') {
                        updateJsonData(formattedJson);
                        $outputText.text(formattedJson);
                        utils.renderJsonTree(formattedJson, $outputTree);
                    }
                    $outputText.html(`<span style="color: var(--secondary);">${LanguageManager.getText('json-valid')}</span>`);
                    $outputTree.html(`<span style="color: var(--secondary);">${LanguageManager.getText('json-valid')}</span>`);
                    utils.historyManager.saveHistory('json', $input.val()); // 保存到历史记录
                    utils.showNotification(LanguageManager.getText('json-validate-success'));
                } else {
                    $outputText.html(`<span style="color: var(--danger);">${validation.error}</span>`);
                    $outputTree.html(`<span style="color: var(--danger);">${validation.error}</span>`);
                    utils.showNotification(LanguageManager.getText('json-validate-error'), true);
                }
            });
        });

        // 复制结果
        $copyBtn.on('click', function() {
            // 检查当前显示的是哪个视图
            const isTreeViewVisible = $outputTree.css('display') !== 'none';
            
            if (isTreeViewVisible && currentJsonData) {
                // 如果树形视图可见且有保存的JSON数据，复制JSON数据
                utils.copyToClipboard(currentJsonData);
            } else {
                // 否则复制文本视图的内容
                utils.copyToClipboard($outputText.text());
            }
        });

        // 清空
        $clearBtn.on('click', function() {
            $input.val('');
            $outputText.text('');
            $outputTree.text('');
            currentJsonData = null; // 清空时也清空保存的数据
            utils.showNotification(LanguageManager.getText('content-cleared'));
        });

        // 历史记录
        $historyBtn.on('click', function() {
            utils.showHistoryModal('json');
        });

        // 加载示例
        $exampleBtn.on('click', function() {
            const examples = [
                {
                    name: "用户信息",
                    json: {
                        "user": {
                            "id": 1001,
                            "username": "developer",
                            "email": "dev@example.com",
                            "profile": {
                                "firstName": "张",
                                "lastName": "三",
                                "age": 28,
                                "isActive": true,
                                "joinDate": "2023-01-15T08:30:00Z"
                            },
                            "roles": ["developer", "admin"],
                            "permissions": {
                                "read": true,
                                "write": true,
                                "delete": false
                            },
                            "preferences": {
                                "theme": "dark",
                                "language": "zh-CN",
                                "notifications": true
                            }
                        }
                    }
                },
                {
                    name: "API响应",
                    json: {
                        "status": "success",
                        "code": 200,
                        "message": "请求成功",
                        "data": {
                            "total": 150,
                            "page": 1,
                            "pageSize": 20,
                            "items": [
                                {
                                    "id": 1,
                                    "title": "JavaScript高级编程",
                                    "author": "Nicholas C. Zakas",
                                    "price": 89.00,
                                    "category": "编程",
                                    "inStock": true,
                                    "tags": ["JavaScript", "前端", "编程"]
                                },
                                {
                                    "id": 2,
                                    "title": "Python数据科学",
                                    "author": "Wes McKinney",
                                    "price": 108.00,
                                    "category": "数据科学",
                                    "inStock": true,
                                    "tags": ["Python", "数据科学", "机器学习"]
                                }
                            ]
                        },
                        "timestamp": "2024-01-20T10:30:45.123Z"
                    }
                },
                {
                    name: "配置文件",
                    json: {
                        "application": {
                            "name": "DevToolBox",
                            "version": "2.0.0",
                            "description": "程序员实用工具集合",
                            "environment": "production",
                            "debug": false,
                            "features": {
                                "json": true,
                                "xml": true,
                                "base64": true,
                                "url": true,
                                "timestamp": true
                            },
                            "database": {
                                "host": "localhost",
                                "port": 3306,
                                "name": "devtoolbox",
                                "user": "admin",
                                "password": "******"
                            },
                            "server": {
                                "host": "0.0.0.0",
                                "port": 8080,
                                "ssl": {
                                    "enabled": true,
                                    "cert": "/path/to/cert.pem",
                                    "key": "/path/to/key.pem"
                                }
                            },
                            "logging": {
                                "level": "info",
                                "file": "/var/log/devtoolbox.log",
                                "maxSize": "10MB",
                                "backupCount": 5
                            }
                        }
                    }
                }
            ];

            // 随机选择一个示例
            const randomExample = examples[Math.floor(Math.random() * examples.length)];
            const exampleJson = JSON.stringify(randomExample.json, null, 2);

            $input.val(exampleJson);
            utils.showNotification(`已加载${randomExample.name}示例`);
        });

        // 标记为已初始化
        this.isInitialized = true;
    }
};

// XML工具模块
const XmlTool = {
    isInitialized: false,
    init(utils) {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('XML工具已经初始化，跳过重复初始化');
            return;
        }

        const $input = $('#xml-input');

        // 设置默认XML示例内容（仅在输入框为空时）
        if (!$input.val().trim()) {
            const defaultXml = `<root>
    <application>
        <name>DevToolBox</name>
        <version>2.0.0</version>
        <description>程序员实用工具集合</description>
        <author>
            <name>Developer</name>
            <email>dev@example.com</email>
        </author>
        <features>
            <feature>
                <name>JSON格式化</name>
                <enabled>true</enabled>
                <category>数据处理</category>
            </feature>
            <feature>
                <name>XML格式化</name>
                <enabled>true</enabled>
                <category>数据处理</category>
            </feature>
            <feature>
                <name>时间戳转换</name>
                <enabled>true</enabled>
                <category>开发工具</category>
            </feature>
        </features>
        <settings>
            <theme>dark</theme>
            <language>zh-CN</language>
            <autoSave>true</autoSave>
        </settings>
    </application>
</root>`;
            $input.val(defaultXml);
        }
        const $output = $('#xml-output');
        const $formatBtn = $('#xml-format');
        const $validateBtn = $('#xml-validate');
        const $copyBtn = $('#xml-copy');
        const $clearBtn = $('#xml-clear');
        const $historyBtn = $('#xml-history');
        
        // 防止重复点击的状态管理
        let isProcessing = false;
        const processingTimeout = 3000; // 3秒超时自动恢复

        // 存储当前的XML数据用于复制
        let currentXmlData = null;

        // 更新XML数据的函数
        function updateXmlData(xmlString) {
            currentXmlData = xmlString;
        }
        
        // 恢复按钮状态的通用函数
        function restoreButtonState($button, $icon, originalIcon) {
            $icon.attr('class', originalIcon);
            $button.prop('disabled', false);
            isProcessing = false;
        }
        
        // 处理按钮点击的通用函数
        function handleButtonClick($button, action) {
            if (isProcessing) {
                console.log('操作正在进行中，请稍候...');
                return false;
            }
            
            isProcessing = true;
            const $icon = $button.find('i');
            const originalIcon = $icon.attr('class');
            
            // 显示处理状态
            $icon.attr('class', 'fa fa-spinner fa-spin');
            $button.prop('disabled', true);
            
            // 设置超时自动恢复
            const timeoutId = setTimeout(() => {
                console.warn('操作超时，自动恢复按钮状态');
                restoreButtonState($button, $icon, originalIcon);
            }, processingTimeout);
            
            // 执行实际操作
            setTimeout(() => {
                try {
                    const result = action();
                    
                    // 清除超时定时器
                    clearTimeout(timeoutId);
                    
                    // 恢复按钮状态
                    restoreButtonState($button, $icon, originalIcon);
                } catch (error) {
                    console.error('操作出错:', error);
                    clearTimeout(timeoutId);
                    restoreButtonState($button, $icon, originalIcon);
                }
            }, 50);
            
            return true;
        }

        // 格式化XML
        $formatBtn.on('click', function() {
            handleButtonClick($(this), () => {
                if (!$input.val().trim()) {
                    $output.html(`<span style="color: var(--danger);">${LanguageManager.getText('xml-empty')}</span>`);
                    utils.showNotification(LanguageManager.getText('xml-empty'), true);
                    return;
                }

                const result = utils.formatXml($input.val());

                if (result.error) {
                    $output.html(`<span style="color: var(--danger);">${result.error}</span>`);
                    utils.showNotification(LanguageManager.getText('xml-format-error'), true);
                } else {
                    $output.text(result);
                    updateXmlData(result); // 保存XML数据用于复制
                    utils.historyManager.saveHistory('xml', $input.val()); // 保存到历史记录
                    utils.showNotification(LanguageManager.getText('xml-format-success'));
                }
            });
        });

        // 验证XML
        $validateBtn.on('click', function() {
            handleButtonClick($(this), () => {
                if (!$input.val().trim()) {
                    $output.html(`<span style="color: var(--secondary);">${LanguageManager.getText('xml-empty')}</span>`);
                    utils.showNotification(LanguageManager.getText('xml-empty'), true);
                    return;
                }

                const validation = utils.validateXml($input.val());

                if (validation.valid) {
                    // 验证成功时，格式化并保存XML数据
                    const formattedXml = utils.formatXml($input.val());
                    if (typeof formattedXml === 'string') {
                        updateXmlData(formattedXml);
                        $output.text(formattedXml);
                    }
                    $output.html(`<span style="color: var(--secondary);">${LanguageManager.getText('xml-valid')}</span>`);
                    utils.historyManager.saveHistory('xml', $input.val()); // 保存到历史记录
                    utils.showNotification(LanguageManager.getText('xml-validate-success'));
                } else {
                    $output.html(`<span style="color: var(--danger);">${validation.error}</span>`);
                    utils.showNotification(LanguageManager.getText('xml-validate-error'), true);
                }
            });
        });

        // 复制结果
        $copyBtn.on('click', function() {
            if (currentXmlData) {
                // 复制保存的XML数据
                utils.copyToClipboard(currentXmlData);
            } else {
                // 否则复制输出区域的内容
                utils.copyToClipboard($output.text());
            }
        });

        // 清空
        $clearBtn.on('click', function() {
            $input.val('');
            $output.text('');
            currentXmlData = null; // 清空时也清空保存的数据
            utils.showNotification(LanguageManager.getText('content-cleared'));
        });

        // 历史记录
        $historyBtn.on('click', function() {
            utils.showHistoryModal('xml');
        });

        // 标记为已初始化
        this.isInitialized = true;
    }
};

// 时间戳工具模块
const TimestampTool = {
    isInitialized: false,
    autoUpdateInterval: null,

    init(utils) {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('时间戳工具已经初始化，跳过重复初始化');
            return;
        }

        const $timestampInput = $('#timestamp-input');
        const $datetimeInput = $('#datetime-input');
        const $toDateBtn = $('#timestamp-to-date');
        const $toTimestampBtn = $('#date-to-timestamp');
        const $clearBtn = $('#timestamp-clear');
        const $refreshBtn = $('#timestamp-refresh');
        const $copyAllBtn = $('#timestamp-copy-all');
        const $conversionResults = $('#conversion-results');

        // 设置默认日期为当前本地时间
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const localDateStr = `${year}-${month}-${day}T${hours}:${minutes}`;
        $datetimeInput.val(localDateStr);

        // 立即更新当前时间戳
        utils.updateCurrentTimestamp();

        // 启动自动更新（每秒更新）
        this.startAutoUpdate();

        // 刷新当前时间戳（手动刷新）
        $refreshBtn.on('click', function() {
            utils.updateCurrentTimestamp();
            utils.showNotification(LanguageManager.getText('timestamp-refreshed'));
        });

        // 实时监听时间戳输入
        let timestampTimeout;
        $timestampInput.on('input', function() {
            clearTimeout(timestampTimeout);
            const value = $(this).val().trim();

            if (value) {
                // 延迟处理，避免频繁计算
                timestampTimeout = setTimeout(() => {
                    TimestampTool.convertTimestampToDate(value, utils);
                    TimestampTool.detectTimestampType(value);
                }, 300);
            } else {
                $conversionResults.hide();
            }
        });

        // 监听日期时间输入
        let datetimeTimeout;
        $datetimeInput.on('input', function() {
            clearTimeout(datetimeTimeout);
            const value = $(this).val();

            if (value) {
                datetimeTimeout = setTimeout(() => {
                    TimestampTool.convertDateToTimestamp(value, utils);
                }, 300);
            } else {
                $conversionResults.hide();
            }
        });

        // 时间戳转日期按钮
        $toDateBtn.on('click', function() {
            const value = $timestampInput.val().trim();
            if (!value) {
                utils.showNotification(LanguageManager.getText('please-enter-timestamp'), true);
                return;
            }
            TimestampTool.convertTimestampToDate(value, utils);
        });

        // 日期转时间戳按钮
        $toTimestampBtn.on('click', function() {
            const value = $datetimeInput.val();
            if (!value) {
                utils.showNotification(LanguageManager.getText('please-select-datetime'), true);
                return;
            }
            TimestampTool.convertDateToTimestamp(value, utils);
        });

        // 快速时间戳按钮
        $('.quick-timestamp-btn').on('click', function() {
            const action = $(this).data('action');
            let timestamp;

            switch(action) {
                case 'now':
                    timestamp = Math.floor(Date.now() / 1000);
                    break;
                case 'today-start':
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    timestamp = Math.floor(today.getTime() / 1000);
                    break;
                case 'today-end':
                    const todayEnd = new Date();
                    todayEnd.setHours(23, 59, 59, 999);
                    timestamp = Math.floor(todayEnd.getTime() / 1000);
                    break;
                case 'tomorrow-start':
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    timestamp = Math.floor(tomorrow.getTime() / 1000);
                    break;
            }

            if (timestamp !== undefined) {
                $timestampInput.val(timestamp);
                TimestampTool.convertTimestampToDate(timestamp, utils);
                TimestampTool.detectTimestampType(timestamp);
            }
        });

        // 快速时间按钮
        $('.quick-time-btn').on('click', function() {
            const time = $(this).data('time');
            const currentValue = $datetimeInput.val();
            const date = currentValue ? new Date(currentValue) : new Date();
            const [hours, minutes] = time.split(':').map(Number);

            date.setHours(hours, minutes, 0, 0);
            const newDateStr = date.toISOString().slice(0, 16);
            $datetimeInput.val(newDateStr);
            TimestampTool.convertDateToTimestamp(newDateStr, utils);
        });

        // 复制单个结果
        $(document).on('click', '.copy-single-btn', function() {
            const targetId = $(this).data('target');
            const $target = $(`#${targetId}`);
            const text = $target.text();

            if (text && text !== '--') {
                utils.copyToClipboard(text);
                showQuickToast(LanguageManager.getText('copy-success'), this);
            }
        });

        // 复制全部结果
        $copyAllBtn.on('click', function() {
            let allText = '';
            $('.result-content').each(function() {
                const title = $(this).closest('.result-card').find('.result-header span').text();
                const content = $(this).text();
                if (content && content !== '--') {
                    allText += `${title}: ${content}\n`;
                }
            });

            if (allText) {
                utils.copyToClipboard(allText.trim());
                utils.showNotification(LanguageManager.getText('copy-success'));
            }
        });

        // 清空
        $clearBtn.on('click', function() {
            $timestampInput.val('');
            $datetimeInput.val('');
            $conversionResults.hide();
            $('.timestamp-hint').removeClass('active');
            utils.showNotification(LanguageManager.getText('content-cleared'));
        });

        // 标记为已初始化
        this.isInitialized = true;
    },

    // 启动自动更新
    startAutoUpdate() {
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
        }

        this.autoUpdateInterval = setInterval(() => {
            Utils.updateCurrentTimestamp();
        }, 1000);
    },

    // 停止自动更新
    stopAutoUpdate() {
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
            this.autoUpdateInterval = null;
        }
    },

    // 检测时间戳类型
    detectTimestampType(timestamp) {
        $('.timestamp-hint').removeClass('active');

        if (timestamp.toString().length > 10) {
            $('[data-type="ms"]').addClass('active');
        } else {
            $('[data-type="sec"]').addClass('active');
        }
    },

    // 时间戳转日期
    convertTimestampToDate(timestamp, utils) {
        const result = utils.timestampToDate(timestamp);
        const $conversionResults = $('#conversion-results');

        if (result.error) {
            utils.showNotification(LanguageManager.getText('timestamp-convert-error'), true);
            return;
        }

        // 填充日期时间输入框（使用本地时间格式）
        const date = new Date(result.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const localDateStr = `${year}-${month}-${day}T${hours}:${minutes}`;
        $('#datetime-input').val(localDateStr);

        // 显示结果
        $('#local-time-content').text(result.local);
        $('#utc-time-content').text(result.utc);
        $('#iso-content').text(result.iso);
        $('#timestamp-sec-content').text(Math.floor(date.getTime() / 1000));
        $('#timestamp-ms-content').text(date.getTime());
        $('#relative-time-content').text(this.getRelativeTime(date));

        $conversionResults.show();
    },

    // 日期转时间戳
    convertDateToTimestamp(dateString, utils) {
        const result = utils.dateToTimestamp(dateString);
        const $conversionResults = $('#conversion-results');

        if (result.error) {
            utils.showNotification(LanguageManager.getText('date-convert-error'), true);
            return;
        }

        // 填充时间戳输入框
        $('#timestamp-input').val(result.seconds);

        // 显示结果
        const date = new Date(dateString);
        $('#local-time-content').text(date.toLocaleString());
        $('#utc-time-content').text(date.toUTCString());
        $('#iso-content').text(date.toISOString());
        $('#timestamp-sec-content').text(result.seconds);
        $('#timestamp-ms-content').text(result.milliseconds);
        $('#relative-time-content').text(this.getRelativeTime(date));

        $conversionResults.show();

        // 检测时间戳类型
        this.detectTimestampType(result.seconds);
    },

    // 获取相对时间
    getRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffSeconds < 0) {
            // 未来时间
            const absSeconds = Math.abs(diffSeconds);
            const absMinutes = Math.floor(absSeconds / 60);
            const absHours = Math.floor(absSeconds / 3600);
            const absDays = Math.floor(absSeconds / 86400);

            if (absSeconds < 60) return `${absSeconds}秒后`;
            if (absMinutes < 60) return `${absMinutes}分钟后`;
            if (absHours < 24) return `${absHours}小时后`;
            if (absDays < 30) return `${absDays}天后`;
            return date.toLocaleDateString();
        } else {
            // 过去时间
            if (diffSeconds < 60) return `${diffSeconds}秒前`;
            if (diffMinutes < 60) return `${diffMinutes}分钟前`;
            if (diffHours < 24) return `${diffHours}小时前`;
            if (diffDays < 30) return `${diffDays}天前`;
            return date.toLocaleDateString();
        }
    }
};

// Base64编码工具模块
const Base64Tool = {
    isInitialized: false,

    init(utils) {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('Base64工具已经初始化，跳过重复初始化');
            return;
        }

        const $inputType = $('input[name="input-type"]');
        const $textInput = $('#base64-input');
        const $fileInput = $('#base64-file');
        const $textInputArea = $('#text-input-area');
        const $fileInputArea = $('#file-input-area');
        const $output = $('#base64-output');
        const $convertBtn = $('#base64-convert');
        const $copyBtn = $('#base64-copy');
        const $clearBtn = $('#base64-clear');
        const $swapBtn = $('#base64-swap');
        const $encodeBtn = $('#base64-convert');
        const $urlSafeMode = $('#base64-url-safe');
        const $noLineWrap = $('#base64-no-wrap');
        const $autoDetect = $('#base64-auto-detect');
        const $fileSelectBtn = $('#file-select-btn');
        const $fileDropZone = $('#file-drop-zone');
        const $modeBtns = $('.mode-btn');
        const $charCount = $('#text-input-area').find('.char-count');
        const $outputCount = $('#text-input-area').find('.output-count');
        const $textCount = $('#text-input-area').find('.char-count');
        const $textBytes = $('#text-input-area').find('.text-bytes');
        const $exampleBtn = $('#base64-example');

        // 使用对象属性存储状态
        Base64Tool.currentFile = null;
        Base64Tool.isProcessing = false;

        // 输入方式切换
        $inputType.on('change', function() {
            const type = $(this).val();
            if (type === 'text') {
                $textInputArea.show();
                $fileInputArea.hide();
            } else {
                $textInputArea.hide();
                $fileInputArea.show();
            }
            Base64Tool.clearOutput();
        });

        // 模式切换
        $modeBtns.on('click', function() {
            $modeBtns.removeClass('active');
            $(this).addClass('active');
            const mode = $(this).data('mode');
            if (mode === 'encode') {
                $('.convert-btn-text').text('编码');
            } else {
                $('.convert-btn-text').text('解码');
            }
            Base64Tool.clearOutput();
        });

        // 文本输入监听
        $textInput.on('input', function() {
            const text = $(this).val();
            $charCount.text(text.length);

            if ($autoDetect.prop('checked') && text) {
                Base64Tool.autoProcess(text, utils);
            }
        });

        // 文件选择
        $fileSelectBtn.on('click', function() {
            $fileInput.click();
        });

        $fileInput.on('change', function() {
            const file = this.files[0];
            if (file) {
                Base64Tool.handleFile(file, utils);
            }
        });

        // 文件拖拽
        $fileDropZone.on('dragover', function(e) {
            e.preventDefault();
            $(this).css('border-color', 'var(--primary)');
        });

        $fileDropZone.on('dragleave', function() {
            $(this).css('border-color', '#d1d5db');
        });

        $fileDropZone.on('drop', function(e) {
            e.preventDefault();
            $(this).css('border-color', '#d1d5db');
            const file = e.originalEvent.dataTransfer.files[0];
            if (file) {
                Base64Tool.handleFile(file, utils);
            }
        });

        // 移除文件 - 使用事件委托
        $(document).on('click', '.remove-file', function() {
            Base64Tool.currentFile = null;
            $fileInput.val('');
            $('#file-list').hide();
            Base64Tool.clearOutput();
        });

        // 转换按钮
        $convertBtn.on('click', function() {
            if (Base64Tool.isProcessing) return;
            Base64Tool.isProcessing = true;

            const mode = $('.mode-btn.active').data('mode');
            const inputType = $('input[name="input-type"]:checked').val();

            if (inputType === 'text') {
                const inputData = $textInput.val();
                if (!inputData.trim()) {
                    utils.showNotification('请输入内容', true);
                    Base64Tool.isProcessing = false;
                    return;
                }
                if (mode === 'encode') {
                    Base64Tool.encodeText(inputData, utils);
                } else {
                    Base64Tool.decodeText(inputData, utils);
                }
            } else if (inputType === 'file' && Base64Tool.currentFile) {
                if (mode === 'encode') {
                    Base64Tool.encodeFile(Base64Tool.currentFile, utils);
                } else {
                    Base64Tool.decodeFile(Base64Tool.currentFile, utils);
                }
            } else {
                utils.showNotification('请选择文件', true);
                Base64Tool.isProcessing = false;
            }
        });

        // 复制结果
        $copyBtn.on('click', function() {
            const output = $output.val();
            if (output) {
                utils.copyToClipboard(output);
            } else {
                utils.showNotification(LanguageManager.getText('no-content-to-copy'), true);
            }
        });

        // 清空
        $clearBtn.on('click', function() {
            Base64Tool.clearAll();
            utils.showNotification(LanguageManager.getText('content-cleared'));
        });

        // 交换输入输出
        $swapBtn.on('click', function() {
            const output = $output.val();
            if (output) {
                $textInput.val(output);
                $output.val('');
                $textCount.text(output.length);
                $textBytes.text(new Blob([output]).size);
                $outputCount.text('0');

                // 切换模式
                const currentMode = $('.mode-btn.active').data('mode');
                $modeBtns.removeClass('active');
                if (currentMode === 'encode') {
                    $('[data-mode="decode"]').addClass('active');
                    $('.convert-btn-text').text('解码');
                } else {
                    $('[data-mode="encode"]').addClass('active');
                    $('.convert-btn-text').text('编码');
                }
            }
        });

        // 加载示例
        $exampleBtn.on('click', function() {
            const example = "Hello, World! 你好，世界！";
            $textInput.val(example);
            $textCount.text(example.length);
            $textBytes.text(new Blob([example]).size);
            Base64Tool.encodeText(example, utils);
        });

        // Base64工具没有输出格式选项，移除这部分代码

        this.isInitialized = true;
    },

    // 处理文件
    handleFile(file, utils) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            utils.showNotification('文件大小不能超过10MB', true);
            return;
        }

        this.currentFile = file;
        // 更新文件列表显示
        const fileList = $('#file-list');
        fileList.html(`
            <div class="file-item">
                <div class="file-info">
                    <i class="fa fa-file"></i>
                    <span>${file.name}</span>
                    <span class="file-size">${utils.formatFileSize(file.size)}</span>
                </div>
                <button class="remove-file btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        `);
        fileList.show();

        // 如果是文本文件，读取内容到输入框
        if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#base64-input').val(e.target.result);
                $('#text-input-area .char-count').text(e.target.result.length);
            };
            reader.readAsText(file);
        }

        this.clearOutput();
    },

    // 编码文本
    encodeText(text, utils) {
        try {
            let encoded = btoa(unescape(encodeURIComponent(text)));

            // 应用选项
            if ($('#base64-url-safe').prop('checked')) {
                encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
            }

            if (!$('#base64-no-wrap').prop('checked')) {
                encoded = encoded.match(/.{1,76}/g)?.join('\n') || encoded;
            }

            this.setOutput(encoded);
            utils.showNotification(LanguageManager.getText('operation-success'));
        } catch (error) {
            this.setOutput('编码失败: ' + error.message, true);
            utils.showNotification('编码失败', true);
        } finally {
            this.isProcessing = false;
        }
    },

    // 编码文件
    encodeFile(file, utils) {
        const reader = new FileReader();
        const self = this;

        reader.onload = function(e) {
            try {
                const arrayBuffer = e.target.result;
                const bytes = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < bytes.length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }

                let encoded = btoa(binary);

                // 应用选项
                if ($('#base64-url-safe').prop('checked')) {
                    encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                }

                if (!$('#base64-no-wrap').prop('checked')) {
                    encoded = encoded.match(/.{1,76}/g)?.join('\n') || encoded;
                }

                self.setOutput(encoded);
                utils.showNotification(LanguageManager.getText('operation-success'));
            } catch (error) {
                self.setOutput('编码失败: ' + error.message, true);
                utils.showNotification('编码失败', true);
            } finally {
                self.isProcessing = false;
            }
        };

        reader.readAsArrayBuffer(file);
    },

    // 解码文本
    decodeText(text, utils) {
        try {
            // 清理输入
            let cleanText = text.replace(/\s/g, '');

            // URL安全模式处理
            if ($('#base64-url-safe').prop('checked')) {
                cleanText = cleanText.replace(/-/g, '+').replace(/_/g, '/');
                // 添加填充
                while (cleanText.length % 4) {
                    cleanText += '=';
                }
            }

            const decoded = decodeURIComponent(escape(atob(cleanText)));
            this.setOutput(decoded);
            utils.showNotification(LanguageManager.getText('operation-success'));
        } catch (error) {
            this.setOutput('解码失败: ' + error.message, true);
            utils.showNotification('解码失败', true);
        } finally {
            this.isProcessing = false;
        }
    },

    // 解码文件
    decodeFile(file, utils) {
        const reader = new FileReader();
        const self = this;

        reader.onload = function(e) {
            try {
                const text = e.target.result;
                self.decodeText(text, utils);
            } catch (error) {
                self.setOutput('读取文件失败: ' + error.message, true);
                utils.showNotification('读取文件失败', true);
                self.isProcessing = false;
            }
        };

        reader.onerror = function() {
            self.setOutput('读取文件失败', true);
            utils.showNotification('读取文件失败', true);
            self.isProcessing = false;
        };

        reader.readAsText(file);
    },

    // 自动处理
    autoProcess(text, utils) {
        // 简单检测是否为Base64
        const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(text.replace(/\s/g, ''));
        const currentMode = $('.base64-mode-btn.active').data('mode');

        if (isBase64 && currentMode === 'encode') {
            // 如果看起来像Base64且当前是编码模式，切换到解码模式
            $('[data-mode="decode"]').click();
            this.decodeText(text, utils);
        } else if (!isBase64 && currentMode === 'decode') {
            // 如果不像Base64且当前是解码模式，切换到编码模式
            $('[data-mode="encode"]').click();
            this.encodeText(text, utils);
        }
    },

    // 设置输出
    setOutput(text, isError = false) {
        const $output = $('#base64-output');
        $output.val(text);
        $('#text-input-area .output-count').text(text.length);

        if (isError) {
            $output.css('color', 'var(--danger)');
        } else {
            $output.css('color', '');
        }
    },

    // 清空输出
    clearOutput() {
        $('#base64-output').val('');
        $('#text-input-area .output-count').text('0');
    },

    // 清空所有
    clearAll() {
        $('#base64-input').val('');
        $('#base64-output').val('');
        $('#base64-file').val('');
        $('#file-list').hide();
        $('#text-input-area .char-count').text('0');
        $('#text-input-area .output-count').text('0');
        this.currentFile = null;
        this.isProcessing = false;
    }
};

// URL编码工具模块
const UrlTool = {
    isInitialized: false,

    init(utils) {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('URL工具已经初始化，跳过重复初始化');
            return;
        }

        const $inputType = $('input[name="url-input-type"]');
        const $textInput = $('#url-input-text');
        const $fileInput = $('#url-file-input');
        const $fileArea = $('#url-file-area');
        const $textArea = $('#url-text-area');
        const $output = $('#url-output-text');
        const $encodeBtn = $('#url-encode');
        const $decodeBtn = $('#url-decode');
        const $copyBtn = $('#url-copy');
        const $clearBtn = $('#url-clear');
        const $swapBtn = $('#url-swap');
        const $encodeFull = $('#url-encode-full');
        const $spaceAsPlus = $('#url-space-as-plus');
        const $formatParams = $('#url-format-params');
        const $formatOptions = $('#url-format-options');
        const $fileSelectBtn = $('#url-file-select-btn');
        const $fileDropZone = $('#url-file-drop-zone');
        const $fileInfo = $('#url-file-info');
        const $fileName = $('#url-file-name');
        const $fileSize = $('#url-file-size');
        const $removeFile = $('#url-remove-file');
        const $textCount = $('#url-text-count');
        const $textBytes = $('#url-text-bytes');
        const $outputCount = $('#url-output-count');
        const $exampleBtn = $('#url-load-example');
        const $modeBtns = $('.url-mode-btn');

        // 使用对象属性存储状态
        UrlTool.currentFile = null;
        UrlTool.isProcessing = false;

        // 输入方式切换
        $inputType.on('change', function() {
            const type = $(this).val();
            if (type === 'text') {
                $textArea.show();
                $fileArea.hide();
            } else {
                $textArea.hide();
                $fileArea.show();
            }
            UrlTool.clearOutput();
        });

        // 模式切换
        $modeBtns.on('click', function() {
            $modeBtns.removeClass('active');
            $(this).addClass('active');
            const mode = $(this).data('mode');
            if (mode === 'encode') {
                $encodeBtn.show();
                $decodeBtn.hide();
                $('.url-input-label').text(LanguageManager.getText('input-text'));
                $('.url-output-label').text(LanguageManager.getText('output-text'));
            } else {
                $encodeBtn.hide();
                $decodeBtn.show();
                $('.url-input-label').text(LanguageManager.getText('input-text'));
                $('.url-output-label').text(LanguageManager.getText('output-text'));
            }
            UrlTool.clearOutput();
        });

        // 文本输入监听
        $textInput.on('input', function() {
            const text = $(this).val();
            $textCount.text(text.length);
            $textBytes.text(new Blob([text]).size);
        });

        // 文件选择
        $fileSelectBtn.on('click', function() {
            $fileInput.click();
        });

        $fileInput.on('change', function() {
            const file = this.files[0];
            if (file) {
                UrlTool.handleFile(file, utils);
            }
        });

        // 文件拖拽
        $fileDropZone.on('dragover', function(e) {
            e.preventDefault();
            $(this).css('border-color', 'var(--primary)');
        });

        $fileDropZone.on('dragleave', function() {
            $(this).css('border-color', '#d1d5db');
        });

        $fileDropZone.on('drop', function(e) {
            e.preventDefault();
            $(this).css('border-color', '#d1d5db');
            const file = e.originalEvent.dataTransfer.files[0];
            if (file) {
                UrlTool.handleFile(file, utils);
            }
        });

        // 移除文件
        $removeFile.on('click', function() {
            UrlTool.currentFile = null;
            $fileInput.val('');
            $fileInfo.hide();
            UrlTool.clearOutput();
        });

        // 编码
        $encodeBtn.on('click', function() {
            if (UrlTool.isProcessing) return;
            UrlTool.isProcessing = true;

            const inputType = $('input[name="url-input-type"]:checked').val();
            let inputData;

            if (inputType === 'text') {
                inputData = $textInput.val();
                if (!inputData.trim()) {
                    utils.showNotification(LanguageManager.getText('please-enter-content'), true);
                    UrlTool.isProcessing = false;
                    return;
                }
                UrlTool.encodeText(inputData, utils);
            } else if (inputType === 'file' && UrlTool.currentFile) {
                UrlTool.encodeFile(UrlTool.currentFile, utils);
            } else {
                utils.showNotification(LanguageManager.getText('please-select-file'), true);
                UrlTool.isProcessing = false;
            }
        });

        // 解码
        $decodeBtn.on('click', function() {
            if (UrlTool.isProcessing) return;
            UrlTool.isProcessing = true;

            const inputType = $('input[name="url-input-type"]:checked').val();
            let inputData;

            if (inputType === 'text') {
                inputData = $textInput.val();
                if (!inputData.trim()) {
                    utils.showNotification(LanguageManager.getText('please-enter-content'), true);
                    UrlTool.isProcessing = false;
                    return;
                }
                UrlTool.decodeText(inputData, utils);
            } else if (inputType === 'file' && UrlTool.currentFile) {
                UrlTool.decodeFile(UrlTool.currentFile, utils);
            } else {
                utils.showNotification(LanguageManager.getText('please-select-file'), true);
                UrlTool.isProcessing = false;
            }
        });

        // 复制结果
        $copyBtn.on('click', function() {
            const output = $output.val();
            if (output) {
                utils.copyToClipboard(output);
            } else {
                utils.showNotification(LanguageManager.getText('no-content-to-copy'), true);
            }
        });

        // 清空
        $clearBtn.on('click', function() {
            UrlTool.clearAll();
            utils.showNotification(LanguageManager.getText('content-cleared'));
        });

        // 交换输入输出
        $swapBtn.on('click', function() {
            const output = $output.val();
            if (output) {
                $textInput.val(output);
                $output.val('');
                $textCount.text(output.length);
                $textBytes.text(new Blob([output]).size);
                $outputCount.text('0');

                // 切换模式
                const currentMode = $('.url-mode-btn.active').data('mode');
                $modeBtns.removeClass('active');
                if (currentMode === 'encode') {
                    $('[data-mode="decode"]').addClass('active');
                    $encodeBtn.hide();
                    $decodeBtn.show();
                } else {
                    $('[data-mode="encode"]').addClass('active');
                    $decodeBtn.hide();
                    $encodeBtn.show();
                }
            }
        });

        // 加载示例
        $exampleBtn.on('click', function() {
            const example = "https://example.com/search?q=Hello World&category=tech&page=1";
            $textInput.val(example);
            $textCount.text(example.length);
            $textBytes.text(new Blob([example]).size);
            UrlTool.encodeText(example, utils);
        });

        // 格式化选项改变
        $formatParams.on('change', function() {
            const output = $output.val();
            if (output) {
                UrlTool.formatOutput(output);
            }
        });

        this.isInitialized = true;
    },

    // 处理文件
    handleFile(file, utils) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            utils.showNotification('文件大小不能超过10MB', true);
            return;
        }

        this.currentFile = file;
        $('#url-file-name').text(file.name);
        $('#url-file-size').text(utils.formatFileSize(file.size));
        $('#url-file-info').show();
        this.clearOutput();

        // 如果是文本文件，读取内容
        if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#url-input-text').val(e.target.result);
                $('#url-text-count').text(e.target.result.length);
                $('#url-text-bytes').text(e.target.result.length);
            };
            reader.readAsText(file);
        }
    },

    // 编码文本
    encodeText(text, utils) {
        try {
            let encoded;

            // 选择编码方式
            if ($('#url-encode-full').prop('checked')) {
                // 完全编码
                encoded = encodeURIComponent(text).replace(/[!'()~*]/g, function(c) {
                    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
                });
            } else if ($('#url-space-as-plus').prop('checked')) {
                // 空格转为+
                encoded = text.replace(/ /g, '+').replace(/[^+\w\-./~]/g, function(c) {
                    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
                });
            } else {
                // 标准URL编码
                encoded = encodeURIComponent(text);
            }

            this.setOutput(encoded);
            utils.showNotification(LanguageManager.getText('operation-success'));
        } catch (error) {
            this.setOutput('编码失败: ' + error.message, true);
            utils.showNotification('编码失败', true);
        } finally {
            this.isProcessing = false;
        }
    },

    // 编码文件
    encodeFile(file, utils) {
        const reader = new FileReader();
        const self = this;

        reader.onload = function(e) {
            try {
                const text = e.target.result;
                self.encodeText(text, utils);
            } catch (error) {
                self.setOutput('读取文件失败: ' + error.message, true);
                utils.showNotification('读取文件失败', true);
                self.isProcessing = false;
            }
        };

        reader.onerror = function() {
            self.setOutput('读取文件失败', true);
            utils.showNotification('读取文件失败', true);
            self.isProcessing = false;
        };

        reader.readAsText(file);
    },

    // 解码文本
    decodeText(text, utils) {
        try {
            let decoded;

            // 处理空格为+的情况
            if ($('#url-space-as-plus').prop('checked')) {
                decoded = decodeURIComponent(text.replace(/\+/g, ' '));
            } else {
                decoded = decodeURIComponent(text);
            }

            this.setOutput(decoded);
            utils.showNotification(LanguageManager.getText('operation-success'));
        } catch (error) {
            this.setOutput('解码失败: ' + error.message, true);
            utils.showNotification('解码失败', true);
        } finally {
            this.isProcessing = false;
        }
    },

    // 解码文件
    decodeFile(file, utils) {
        const reader = new FileReader();
        const self = this;

        reader.onload = function(e) {
            try {
                const text = e.target.result;
                self.decodeText(text, utils);
            } catch (error) {
                self.setOutput('读取文件失败: ' + error.message, true);
                utils.showNotification('读取文件失败', true);
                self.isProcessing = false;
            }
        };

        reader.onerror = function() {
            self.setOutput('读取文件失败', true);
            utils.showNotification('读取文件失败', true);
            self.isProcessing = false;
        };

        reader.readAsText(file);
    },

    // 格式化输出
    formatOutput(text) {
        const format = $('#url-format-options').val();
        let formatted = text;

        switch (format) {
            case 'json':
                try {
                    // 尝试解析为URL参数并格式化为JSON
                    const params = new URLSearchParams(text);
                    const json = {};
                    for (let [key, value] of params) {
                        if (json[key]) {
                            if (Array.isArray(json[key])) {
                                json[key].push(value);
                            } else {
                                json[key] = [json[key], value];
                            }
                        } else {
                            json[key] = value;
                        }
                    }
                    formatted = JSON.stringify(json, null, 2);
                } catch (e) {
                    formatted = text;
                }
                break;
            case 'table':
                try {
                    // 尝试解析为URL参数并格式化为表格
                    const params = new URLSearchParams(text);
                    let table = '<table style="border-collapse: collapse; width: 100%;">';
                    table += '<tr><th style="border: 1px solid #ddd; padding: 8px;">参数名</th><th style="border: 1px solid #ddd; padding: 8px;">参数值</th></tr>';
                    for (let [key, value] of params) {
                        table += `<tr><td style="border: 1px solid #ddd; padding: 8px;">${utils.escapeHtml(key)}</td><td style="border: 1px solid #ddd; padding: 8px;">${utils.escapeHtml(value)}</td></tr>`;
                    }
                    table += '</table>';
                    formatted = table;
                } catch (e) {
                    formatted = text;
                }
                break;
            case 'query':
                // 已经是查询字符串格式，不做处理
                formatted = text;
                break;
        }

        this.setOutput(formatted);
    },

    // 设置输出
    setOutput(text, isError = false) {
        const $output = $('#url-output-text');
        $output.val(text);
        $('#url-output-count').text(text.length);

        if (isError) {
            $output.css('color', 'var(--danger)');
        } else {
            $output.css('color', '');
        }
    },

    // 清空输出
    clearOutput() {
        $('#url-output-text').val('');
        $('#url-output-count').text('0');
    },

    // 清空所有
    clearAll() {
        $('#url-input-text').val('');
        $('#url-output-text').val('');
        $('#url-file-input').val('');
        $('#url-file-info').hide();
        $('#url-text-count').text('0');
        $('#url-text-bytes').text('0');
        $('#url-output-count').text('0');
        this.currentFile = null;
        this.isProcessing = false;
    }
};

// 正则表达式测试工具模块
const RegexTool = {
    isInitialized: false,

    init(utils) {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('正则表达式工具已经初始化，跳过重复初始化');
            return;
        }

        const $pattern = $('#regex-pattern');
        const $testText = $('#regex-test-text');
        const $results = $('#regex-results');
        const $highlighted = $('#regex-highlighted');
        const $matchesList = $('#regex-matches-list');
        const $matchCount = $('#regex-match-count');
        const $matchTime = $('#regex-match-time');
        const $status = $('#regex-status');
        const $textCount = $('#regex-text-count');
        const $lineCount = $('#regex-line-count');

        // 标志复选框
        const $flagG = $('#regex-flag-g');
        const $flagI = $('#regex-flag-i');
        const $flagM = $('#regex-flag-m');
        const $flagS = $('#regex-flag-s');
        const $flagU = $('#regex-flag-u');
        const $flagY = $('#regex-flag-y');

        // 按钮
        const $testBtn = $('#regex-test');
        const $copyBtn = $('#regex-copy');
        const $clearAllBtn = $('#regex-clear-all');
        const $clearTextBtn = $('#regex-clear-text');
        const $loadExampleBtn = $('#regex-load-example');

        // 状态管理
        let isProcessing = false;

        // 示例文本
        const examples = [
            {
                name: "邮箱验证",
                text: `联系邮箱：support@example.com
客服邮箱：service@company.co.uk
无效邮箱：invalid-email
测试邮箱：user.name+tag@domain.org
手机号：13812345678
日期：2024-01-20`
            },
            {
                name: "URL提取",
                text: `常用网站：
https://www.google.com
http://github.com/user/repo
https://example.com/path?query=value#fragment
ftp://files.server.com/path
无效链接：not-a-url
www.no-protocol.com`
            },
            {
                name: "日期匹配",
                text: `重要日期：
2024-01-20 - 项目启动
2024/02/15 - 里程碑1
2024-03-30 里程碑2
2024-12-31 项目结束
2023-13-01 无效日期
2024-02-30 无效日期`
            },
            {
                name: "手机号验证",
                text: `用户手机号：
13812345678
15987654321
18612345678
无效号码：
12345678901
1381234567
186123456789
固定电话：010-12345678`
            }
        ];

        // 实时测试正则表达式
        function testRegex() {
            if (isProcessing) return;

            const pattern = $pattern.val().trim();
            const text = $testText.val();

            if (!pattern) {
                $status.html('<i class="fa fa-info-circle" style="margin-right: 0.25rem;"></i>请输入正则表达式');
                $results.hide();
                return;
            }

            try {
                // 构建正则表达式
                const flags = [];
                if ($flagG.prop('checked')) flags.push('g');
                if ($flagI.prop('checked')) flags.push('i');
                if ($flagM.prop('checked')) flags.push('m');
                if ($flagS.prop('checked')) flags.push('s');
                if ($flagU.prop('checked')) flags.push('u');
                if ($flagY.prop('checked')) flags.push('y');

                const flagStr = flags.join('');
                const regex = new RegExp(pattern, flagStr);

                // 开始测试
                const startTime = performance.now();
                const matches = text.match(regex);
                const endTime = performance.now();

                const matchTime = Math.round((endTime - startTime) * 100) / 100;

                // 更新状态
                $status.html('<i class="fa fa-check-circle" style="margin-right: 0.25rem; color: var(--secondary);"></i>正则表达式有效');

                // 显示结果
                if (matches) {
                    $matchCount.text(matches.length);
                    $matchTime.text(matchTime);
                    $results.show();

                    // 高亮显示匹配
                    let highlightedText = text;
                    let offset = 0;

                    if (flagStr.includes('g')) {
                        // 全局匹配
                        let match;
                        while ((match = regex.exec(text)) !== null) {
                            const matchText = match[0];
                            const startIndex = match.index + offset;
                            const endIndex = startIndex + matchText.length;

                            highlightedText = highlightedText.substring(0, startIndex) +
                                '<mark style="background-color: #fbbf24; color: #1f2937; padding: 2px 4px; border-radius: 2px;">' +
                                matchText + '</mark>' + highlightedText.substring(endIndex);

                            offset += 39; // mark标签的长度
                        }
                    } else {
                        // 非全局匹配，只高亮第一个
                        const match = text.match(regex);
                        if (match) {
                            const matchText = match[0];
                            const startIndex = match.index;
                            const endIndex = startIndex + matchText.length;

                            highlightedText = text.substring(0, startIndex) +
                                '<mark style="background-color: #fbbf24; color: #1f2937; padding: 2px 4px; border-radius: 2px;">' +
                                matchText + '</mark>' + text.substring(endIndex);
                        }
                    }

                    $highlighted.html(highlightedText);

                    // 显示匹配详情
                    let detailsHtml = '';
                    regex.lastIndex = 0; // 重置正则表达式的lastIndex
                    let matchIndex = 0;

                    if (flagStr.includes('g')) {
                        let match;
                        while ((match = regex.exec(text)) !== null) {
                            detailsHtml += `
                                <div style="margin-bottom: 0.75rem; padding: 0.5rem; background-color: white; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
                                    <div style="font-weight: 500; color: var(--primary); margin-bottom: 0.25rem;">匹配 ${matchIndex + 1}:</div>
                                    <div style="color: #374151; margin-bottom: 0.25rem;">位置: ${match.index} - ${match.index + match[0].length}</div>
                                    <div style="color: #6b7280;">完整匹配: <code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${match[0]}</code></div>`;

                            if (match.length > 1) {
                                detailsHtml += '<div style="color: #6b7280; margin-top: 0.25rem;">捕获组:';
                                for (let i = 1; i < match.length; i++) {
                                    detailsHtml += `<br>  组${i}: <code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${match[i] || '(空)'}</code>`;
                                }
                                detailsHtml += '</div>';
                            }

                            detailsHtml += '</div>';
                            matchIndex++;
                        }
                    } else {
                        const match = text.match(regex);
                        if (match) {
                            detailsHtml += `
                                <div style="margin-bottom: 0.75rem; padding: 0.5rem; background-color: white; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
                                    <div style="font-weight: 500; color: var(--primary); margin-bottom: 0.25rem;">匹配 1:</div>
                                    <div style="color: #374151; margin-bottom: 0.25rem;">位置: ${match.index} - ${match.index + match[0].length}</div>
                                    <div style="color: #6b7280;">完整匹配: <code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${match[0]}</code></div>`;

                            if (match.length > 1) {
                                detailsHtml += '<div style="color: #6b7280; margin-top: 0.25rem;">捕获组:';
                                for (let i = 1; i < match.length; i++) {
                                    detailsHtml += `<br>  组${i}: <code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${match[i] || '(空)'}</code>`;
                                }
                                detailsHtml += '</div>';
                            }

                            detailsHtml += '</div>';
                        }
                    }

                    $matchesList.html(detailsHtml || '<div style="color: #6b7280; font-style: italic;">没有匹配到任何内容</div>');
                } else {
                    $matchCount.text('0');
                    $matchTime.text(matchTime);
                    $results.show();
                    $highlighted.text(text);
                    $matchesList.html('<div style="color: #6b7280; font-style: italic;">没有匹配到任何内容</div>');
                }

            } catch (error) {
                $status.html(`<i class="fa fa-exclamation-circle" style="margin-right: 0.25rem; color: var(--danger);"></i>正则表达式错误: ${error.message}`);
                $results.hide();
            }
        }

        // 输入监听 - 实时测试
        $pattern.on('input', testRegex);
        $testText.on('input', function() {
            const text = $(this).val();
            $textCount.text(text.length);
            $lineCount.text(text.split('\n').length);
            testRegex();
        });

        // 标志变化时重新测试
        $('input[id^="regex-flag-"]').on('change', testRegex);

        // 常用正则按钮点击
        $('.regex-common-btn').on('click', function() {
            const regex = $(this).data('regex');
            const desc = $(this).data('desc');
            $pattern.val(regex);
            utils.showNotification(`已应用${desc}正则表达式`);
            testRegex();
        });

        // 测试按钮
        $testBtn.on('click', testRegex);

        // 复制正则表达式
        $copyBtn.on('click', function() {
            const pattern = $pattern.val().trim();
            if (pattern) {
                const flags = [];
                if ($flagG.prop('checked')) flags.push('g');
                if ($flagI.prop('checked')) flags.push('i');
                if ($flagM.prop('checked')) flags.push('m');
                if ($flagS.prop('checked')) flags.push('s');
                if ($flagU.prop('checked')) flags.push('u');
                if ($flagY.prop('checked')) flags.push('y');

                const flagStr = flags.join('');
                const fullRegex = `/${pattern}/${flagStr}`;
                utils.copyToClipboard(fullRegex);
                utils.showNotification('正则表达式已复制');
            } else {
                utils.showNotification('请先输入正则表达式', true);
            }
        });

        // 清空全部
        $clearAllBtn.on('click', function() {
            $pattern.val('');
            $testText.val('');
            $results.hide();
            $status.html('<i class="fa fa-info-circle" style="margin-right: 0.25rem;"></i>请输入正则表达式');
            $textCount.text('0');
            $lineCount.text('1');
            $('input[id^="regex-flag-"]').prop('checked', false);
            utils.showNotification('已清空全部内容');
        });

        // 清空文本
        $clearTextBtn.on('click', function() {
            $testText.val('');
            $textCount.text('0');
            $lineCount.text('1');
            testRegex();
        });

        // 加载示例
        $loadExampleBtn.on('click', function() {
            const randomExample = examples[Math.floor(Math.random() * examples.length)];
            $testText.val(randomExample.text);
            $textCount.text(randomExample.text.length);
            $lineCount.text(randomExample.text.split('\n').length);
            utils.showNotification(`已加载${randomExample.name}示例`);
            testRegex();
        });

        // 标记为已初始化
        this.isInitialized = true;
    }
};

// UUID生成器模块
const UuidTool = {
    isInitialized: false,
    generatedUuids: [],
    totalGenerated: 0,

    init(utils) {
        // 防止重复初始化
        if (this.isInitialized) {
            console.log('UUID生成器已经初始化，跳过重复初始化');
            return;
        }

        const $version = $('#uuid-version');
        const $count = $('#uuid-count');
        const $format = $('#uuid-format');
        const $case = $('input[name="uuid-case"]');
        const $generateBtn = $('#uuid-generate');
        const $copyAllBtn = $('#uuid-copy-all');
        const $clearBtn = $('#uuid-clear');
        const $results = $('#uuid-results');
        const $list = $('#uuid-list');
        const $resultCount = $('#uuid-result-count');
        const $totalCount = $('#uuid-total-count');
        const $lastTime = $('#uuid-last-time');
        const $duplicateStatus = $('#uuid-duplicate-status');
        const $batchOperations = $('#uuid-batch-operations');

        // 状态管理
        let isProcessing = false;

        // 生成UUID v4
        function generateUUIDv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        // 生成UUID v1
        function generateUUIDv1() {
            const timestamp = Date.now();
            const timestampHex = timestamp.toString(16).padStart(12, '0');

            // 模拟时钟序列和节点ID
            const clockSeq = Math.floor(Math.random() * 16384).toString(16).padStart(4, '0');
            const node = Math.floor(Math.random() * 16777216).toString(16).padStart(12, '0');

            return `${timestampHex.substr(0, 8)}-${timestampHex.substr(8, 4)}-1${clockSeq.substr(0, 3)}-${clockSeq.substr(3)}-${node}`;
        }

        // 格式化UUID
        function formatUUID(uuid, format, caseType) {
            let formatted = uuid;

            // 应用格式
            switch (format) {
                case 'no-hyphens':
                    formatted = uuid.replace(/-/g, '');
                    break;
                case 'upper':
                    formatted = uuid.toUpperCase();
                    break;
                case 'braces':
                    formatted = `{${uuid}}`;
                    break;
                case 'urn':
                    formatted = `urn:uuid:${uuid}`;
                    break;
                case 'standard':
                default:
                    // 保持标准格式
                    break;
            }

            // 应用大小写
            if (caseType === 'upper' && format !== 'upper') {
                formatted = formatted.toUpperCase();
            } else if (caseType === 'lower' && format === 'upper') {
                formatted = formatted.toLowerCase();
            }

            return formatted;
        }

        // 生成UUID
        function generateUUIDs() {
            if (isProcessing) return;

            const version = $version.val();
            const count = parseInt($count.val());
            const format = $format.val();
            const caseType = $('input[name="uuid-case"]:checked').val();

            if (count < 1 || count > 100) {
                utils.showNotification('生成数量必须在1-100之间', true);
                return;
            }

            isProcessing = true;
            const newUuids = [];

            try {
                for (let i = 0; i < count; i++) {
                    let uuid;

                    switch (version) {
                        case '1':
                            uuid = generateUUIDv1();
                            break;
                        case 'nil':
                            uuid = '00000000-0000-0000-0000-000000000000';
                            break;
                        case '4':
                        default:
                            uuid = generateUUIDv4();
                            break;
                    }

                    const formattedUuid = formatUUID(uuid, format, caseType);
                    newUuids.push({
                        original: uuid,
                        formatted: formattedUuid,
                        version: version,
                        timestamp: new Date().toISOString()
                    });
                }

                // 检查重复
                const hasDuplicates = this.checkDuplicates(newUuids);

                // 更新生成的UUID列表
                this.generatedUuids = [...this.generatedUuids, ...newUuids];
                this.totalGenerated += count;

                // 显示结果
                this.displayResults(newUuids, hasDuplicates);

                // 更新统计信息
                this.updateStatistics();

                // 显示批量操作按钮
                if (this.generatedUuids.length > 0) {
                    $batchOperations.show();
                }

                utils.showNotification(`成功生成${count}个UUID`);

            } catch (error) {
                console.error('生成UUID失败:', error);
                utils.showNotification('生成UUID失败', true);
            } finally {
                isProcessing = false;
            }
        }

        // 检查重复
        function checkDuplicates(newUuids) {
            const existingSet = new Set(this.generatedUuids.map(u => u.formatted));
            const hasDuplicates = newUuids.some(uuid => existingSet.has(uuid.formatted));

            if (hasDuplicates) {
                $duplicateStatus.html('<i class="fa fa-exclamation-triangle" style="margin-right: 0.25rem;"></i><span data-i18n="has-duplicates">发现重复</span>');
                $duplicateStatus.css('color', 'var(--warning)');
            } else {
                $duplicateStatus.html('<i class="fa fa-check" style="margin-right: 0.25rem;"></i><span data-i18n="no-duplicates">无重复</span>');
                $duplicateStatus.css('color', 'var(--secondary)');
            }

            return hasDuplicates;
        }

        // 显示结果
        function displayResults(uuids, hasDuplicates) {
            let listHtml = '';

            uuids.forEach((uuid, index) => {
                const isDuplicate = hasDuplicates &&
                    this.generatedUuids.filter(u => u.formatted === uuid.formatted).length > 1;

                listHtml += `
                    <div class="uuid-item" style="margin-bottom: 0.75rem; padding: 0.75rem; background-color: white; border: 1px solid #e5e7eb; border-radius: 0.375rem; ${isDuplicate ? 'border-color: var(--warning);' : ''}">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                            <div style="font-family: monospace; font-size: 0.875rem; font-weight: 500; color: #374151;">
                                ${uuid.formatted}
                                ${isDuplicate ? '<i class="fa fa-exclamation-triangle" style="margin-left: 0.5rem; color: var(--warning);" title="重复的UUID"></i>' : ''}
                            </div>
                            <div style="display: flex; gap: 0.25rem;">
                                <button class="copy-uuid btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" data-uuid="${uuid.formatted}">
                                    <i class="fa fa-copy"></i>
                                </button>
                                <button class="remove-uuid btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" data-index="${this.generatedUuids.length - uuids.length + index}">
                                    <i class="fa fa-times"></i>
                                </button>
                            </div>
                        </div>
                        <div style="font-size: 0.75rem; color: #6b7280;">
                            版本: UUID v${uuid.version} |
                            生成时间: ${new Date(uuid.timestamp).toLocaleString('zh-CN')}
                        </div>
                    </div>
                `;
            });

            $list.html(listHtml);
            $results.show();
            $resultCount.text(uuids.length);
        }

        // 更新统计信息
        function updateStatistics() {
            $totalCount.text(this.totalGenerated);
            $lastTime.text(new Date().toLocaleString('zh-CN'));
        }

        // 复制单个UUID
        $(document).on('click', '.copy-uuid', function() {
            const uuid = $(this).data('uuid');
            utils.copyToClipboard(uuid);
            utils.showNotification('UUID已复制');
        });

        // 删除单个UUID
        $(document).on('click', '.remove-uuid', function() {
            const index = parseInt($(this).data('index'));
            this.generatedUuids.splice(index, 1);
            this.totalGenerated = Math.max(0, this.totalGenerated - 1);

            // 重新显示结果
            this.displayResults(this.generatedUuids, false);
            this.updateStatistics();

            if (this.generatedUuids.length === 0) {
                $results.hide();
                $batchOperations.hide();
            }

            utils.showNotification('UUID已删除');
        });

        // 快速数量按钮
        $('.uuid-quick-count').on('click', function() {
            const count = $(this).data('count');
            $count.val(count);
        });

        // 生成按钮
        $generateBtn.on('click', generateUUIDs.bind(this));

        // 复制全部
        $copyAllBtn.on('click', function() {
            if (this.generatedUuids.length === 0) {
                utils.showNotification('没有可复制的UUID', true);
                return;
            }

            const allUuids = this.generatedUuids.map(u => u.formatted).join('\n');
            utils.copyToClipboard(allUuids);
            utils.showNotification(`已复制${this.generatedUuids.length}个UUID`);
        });

        // 清空
        $clearBtn.on('click', function() {
            this.generatedUuids = [];
            this.totalGenerated = 0;
            $results.hide();
            $batchOperations.hide();
            $totalCount.text('0');
            $lastTime.text('--');
            utils.showNotification('已清空所有UUID');
        });

        // 导出JSON
        $('#uuid-export-json').on('click', function() {
            const exportData = {
                generated_at: new Date().toISOString(),
                total_count: this.generatedUuids.length,
                uuids: this.generatedUuids
            };

            const jsonData = JSON.stringify(exportData, null, 2);
            this.downloadFile('uuids.json', jsonData, 'application/json');
            utils.showNotification('JSON文件已导出');
        });

        // 导出CSV
        $('#uuid-export-csv').on('click', function() {
            let csvContent = 'UUID,Version,Format,Timestamp\n';
            this.generatedUuids.forEach(uuid => {
                csvContent += `"${uuid.formatted}",${uuid.version},"${$('#uuid-format option:selected').text()}","${uuid.timestamp}"\n`;
            });

            this.downloadFile('uuids.csv', csvContent, 'text/csv');
            utils.showNotification('CSV文件已导出');
        });

        // 导出文本
        $('#uuid-export-txt').on('click', function() {
            const textContent = this.generatedUuids.map(u => u.formatted).join('\n');
            this.downloadFile('uuids.txt', textContent, 'text/plain');
            utils.showNotification('文本文件已导出');
        });

        // 下载文件
        function downloadFile(filename, content, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // 绑定方法到对象
        this.generateUUIDs = generateUUIDs.bind(this);
        this.checkDuplicates = checkDuplicates.bind(this);
        this.displayResults = displayResults.bind(this);
        this.updateStatistics = updateStatistics.bind(this);
        this.downloadFile = downloadFile.bind(this);

        // 标记为已初始化
        this.isInitialized = true;
    }
};