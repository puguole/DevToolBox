// 工具函数模块
const Utils = {
    // 显示加载指示器
    showLoader() {
        $('#loader').removeClass('hidden');
    },

    // 隐藏加载指示器
    hideLoader() {
        $('#loader').addClass('hidden');
    },

    // 显示通知
    showNotification(message, isError = false) {
        const $notification = $('#notification');
        const $notificationText = $('#notification-text');
        const $notificationIcon = $('#notification-icon');

        $notificationText.text(message);
        $notificationIcon.attr('class', isError ? 'fa fa-exclamation-circle mr-2' : 'fa fa-check-circle mr-2');
        $notification.removeClass('translate-y-20 opacity-0 bg-danger bg-dark');
        $notification.addClass(isError ? 'bg-danger' : 'bg-dark');

        setTimeout(() => {
            $notification.addClass('translate-y-20 opacity-0');
        }, 3000);
    },

    // 复制到剪贴板
    copyToClipboard(text) {
        if (!text) {
            this.showNotification(LanguageManager.getText('no-content-to-copy'), true);
            return false;
        }

        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(LanguageManager.getText('copy-success'));
            return true;
        }).catch(err => {
            console.error('无法复制: ', err);
            this.showNotification(LanguageManager.getText('copy-failed'), true);
            return false;
        });
    },

    // 验证JSON
    validateJson(jsonString) {
        try {
            if (!jsonString.trim()) return { valid: false, error: LanguageManager.getText('json-empty') };
            JSON.parse(jsonString);
            return { valid: true };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    },

    // 格式化JSON
    formatJson(jsonString, indent = 2) {
        try {
            const obj = JSON.parse(jsonString);
            return JSON.stringify(obj, null, indent);
        } catch (e) {
            return { error: e.message };
        }
    },

    // 压缩JSON
    minifyJson(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            return JSON.stringify(obj);
        } catch (e) {
            return { error: e.message };
        }
    },

    // 渲染JSON树形结构
    renderJsonTree(data, $container) {
        $container.empty();
        
        // 格式化字符串值，正确显示JSON转义字符
        function formatStringValue(str) {
            return str.replace(/[\"'\\\/\b\f\n\r\t]/g, function(match) {
                switch (match) {
                    case '\"': return '&quot;';
                    case '\'': return '&apos;';
                    case '\\': return '&#92;';
                    case '\/': return '&#47;';
                    case '\b': return '\\b';
                    case '\f': return '\\f';
                    case '\n': return '\\n';
                    case '\r': return '\\r';
                    case '\t': return '\\t';
                    default: return match;
                }
            });
        }
        
        function renderNode(node, $parentElement, key = '', isArrayIndex = false) {
            const isObject = typeof node === 'object' && node !== null;
            const isArray = Array.isArray(node);
            const isCollapsible = isObject || isArray;
            
            // 创建节点容器
            const $nodeContainer = $('<div>').addClass('json-tree-node');
            
            // 创建节点内容行
            const $nodeLine = $('<div>').addClass('json-tree-line flex items-start');
            
            // 添加缩进
            const indentLevel = $parentElement.closest('.json-tree-node').length;
            const $indent = $('<span>').addClass('json-tree-indent').css('width', (indentLevel * 20) + 'px');
            $nodeLine.append($indent);
            
            // 如果是可折叠的，添加折叠按钮
            if (isCollapsible) {
                const $toggleBtn = $('<button>')
                    .addClass('json-tree-toggle text-gray-500 hover:text-gray-700 focus:outline-none mr-1')
                    .html('<i class="fa fa-chevron-down"></i>')
                    .on('click', function() {
                        const isExpanded = $childContainer.css('display') !== 'none';
                        $childContainer.toggle(!isExpanded);
                        $(this).html(isExpanded ? 
                            '<i class="fa fa-chevron-right"></i>' : 
                            '<i class="fa fa-chevron-down"></i>');
                        $nodeContainer.toggleClass('collapsed', isExpanded);
                    });
                $nodeLine.append($toggleBtn);
            } else {
                // 添加占位符
                $nodeLine.append('<span class="json-tree-placeholder mr-1"></span>');
            }
            
            // 添加键名（如果不是数组索引）
            if (key && !isArrayIndex) {
                const $keySpan = $('<span>').addClass('json-key text-blue-600 font-mono').text(`"${key}": `);
                $nodeLine.append($keySpan);
            } else if (isArrayIndex) {
                const $keySpan = $('<span>').addClass('json-array-index text-gray-500 font-mono').text(`${key}: `);
                $nodeLine.append($keySpan);
            }
            
            // 添加值
            if (isArray) {
                const $valueSpan = $('<span>').addClass('json-bracket text-gray-600 font-mono')
                    .html(`<span class="json-array-symbol">[</span>
                           <span class="json-array-info text-gray-400 text-xs ml-1">${node.length} items</span>
                           <span class="json-array-symbol">]</span>`);
                $nodeLine.append($valueSpan);
            } else if (isObject) {
                const keys = Object.keys(node);
                const $valueSpan = $('<span>').addClass('json-bracket text-gray-600 font-mono')
                    .html(`<span class="json-object-symbol">{</span>
                           <span class="json-object-info text-gray-400 text-xs ml-1">${keys.length} keys</span>
                           <span class="json-object-symbol">}</span>`);
                $nodeLine.append($valueSpan);
            } else if (typeof node === 'string') {
                // 处理字符串，显示转义字符
                const formattedValue = formatStringValue(node);
                const $valueSpan = $('<span>').addClass('json-string text-green-600 font-mono')
                    .html(`"${formattedValue}"`);
                $nodeLine.append($valueSpan);
            } else if (typeof node === 'number') {
                const $valueSpan = $('<span>').addClass('json-number text-purple-600 font-mono').text(node);
                $nodeLine.append($valueSpan);
            } else if (typeof node === 'boolean') {
                const $valueSpan = $('<span>').addClass('json-boolean text-indigo-600 font-mono').text(node);
                $nodeLine.append($valueSpan);
            } else if (node === null) {
                const $valueSpan = $('<span>').addClass('json-null text-gray-500 font-mono').text('null');
                $nodeLine.append($valueSpan);
            }
            
            $nodeContainer.append($nodeLine);
            
            // 如果是可折叠的，添加子节点容器
            let $childContainer;
            if (isCollapsible) {
                $childContainer = $('<div>').addClass('json-tree-children ml-4');
                $nodeContainer.append($childContainer);
                
                // 渲染子节点
                const entries = isArray ? 
                    node.map((value, index) => [index, value]) : 
                    Object.entries(node);
                
                entries.forEach(([childKey, childValue]) => {
                    renderNode(childValue, $childContainer, childKey, isArray);
                });
            }
            
            $parentElement.append($nodeContainer);
        }
        
        try {
            const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
            renderNode(jsonData, $container);
        } catch (error) {
            $container.html(`<span class="text-danger">${error.message}</span>`);
        }
    },

    // 格式化XML
    formatXml(xmlString, indent = 2) {
        try {
            // 使用DOMParser解析XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");

            // 检查解析错误
            const parserError = xmlDoc.getElementsByTagName("parsererror")[0];
            if (parserError) {
                return { error: parserError.textContent };
            }

            // 递归格式化XML节点
            function formatNode(node, level = 0) {
                const indentStr = ' '.repeat(indent * level);

                if (node.nodeType === 3) { // 文本节点
                    const text = node.textContent.trim();
                    return text ? text : '';
                }

                if (node.nodeType === 1) { // 元素节点
                    let result = indentStr + '<' + node.nodeName;

                    // 添加属性
                    for (let i = 0; i < node.attributes.length; i++) {
                        const attr = node.attributes[i];
                        result += ' ' + attr.name + '="' + attr.value + '"';
                    }

                    // 检查是否有子节点
                    if (node.childNodes.length === 0) {
                        result += ' />';
                        return result;
                    } else {
                        result += '>';

                        // 处理子节点
                        const childContents = [];
                        let hasElementChildren = false;

                        for (let i = 0; i < node.childNodes.length; i++) {
                            const childContent = formatNode(node.childNodes[i], level + 1);
                            if (childContent) {
                                childContents.push(childContent);
                                if (node.childNodes[i].nodeType === 1) {
                                    hasElementChildren = true;
                                }
                            }
                        }

                        if (childContents.length > 0) {
                            if (hasElementChildren) {
                                result += '\n' + childContents.join('\n') + '\n' + indentStr;
                            } else {
                                result += childContents.join('');
                            }
                        }

                        result += '</' + node.nodeName + '>';
                        return result;
                    }
                }

                return '';
            }

            // 从根元素开始格式化
            const rootElement = xmlDoc.documentElement;
            let formatted = formatNode(rootElement, 0);

            return formatted;
        } catch (e) {
            return { error: e.message };
        }
    },

    // 压缩XML
    minifyXml(xmlString) {
        try {
            // 移除注释
            let minified = xmlString.replace(/<!--[\s\S]*?-->/g, '');
            // 移除标签之间的空白
            minified = minified.replace(/>\s+</g, '><');
            // 移除前导和尾随空白
            return minified.trim();
        } catch (e) {
            return { error: e.message };
        }
    },

    // 验证XML
    validateXml(xmlString) {
        try {
            if (!xmlString.trim()) return { valid: false, error: LanguageManager.getText('xml-empty') };

            // 创建DOMParser进行验证
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlString, "application/xml");

            // 检查解析错误
            const errors = doc.getElementsByTagName("parsererror");
            if (errors.length > 0) {
                return { valid: false, error: errors[0].textContent };
            }

            return { valid: true };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    },

    // 解析XML为JSON结构用于树形展示
    xmlToJson(xmlString) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");

            function parseNode(node) {
                // 处理文本节点
                if (node.nodeType === 3) {
                    const text = node.nodeValue.trim();
                    return text ? text : null;
                }

                // 处理元素节点
                if (node.nodeType === 1) {
                    const result = {};

                    // 处理属性
                    if (node.attributes.length > 0) {
                        result.attributes = {};
                        for (let i = 0; i < node.attributes.length; i++) {
                            const attr = node.attributes[i];
                            result.attributes[attr.name] = attr.value;
                        }
                    }

                    // 处理子节点
                    const children = Array.from(node.childNodes).filter(child =>
                        child.nodeType === 1 || (child.nodeType === 3 && child.nodeValue.trim() !== '')
                    );

                    if (children.length > 0) {
                        // 检查是否有多个相同名称的子节点
                        const childNames = {};
                        children.forEach(child => {
                            if (child.nodeType === 1) {
                                const name = child.nodeName;
                                childNames[name] = (childNames[name] || 0) + 1;
                            }
                        });

                        children.forEach(child => {
                            if (child.nodeType === 1) {
                                const name = child.nodeName;
                                const childData = parseNode(child);

                                // 如果有多个相同名称的子节点，使用数组
                                if (childNames[name] > 1) {
                                    if (!result[name]) {
                                        result[name] = [];
                                    }
                                    result[name].push(childData);
                                } else {
                                    result[name] = childData;
                                }
                            } else if (child.nodeType === 3) {
                                // 文本节点
                                result.value = child.nodeValue.trim();
                            }
                        });
                    }

                    return result;
                }

                return null;
            }

            return {
                name: xmlDoc.documentElement.nodeName,
                data: parseNode(xmlDoc.documentElement)
            };
        } catch (e) {
            return { error: e.message };
        }
    },

    // 渲染XML树形结构
    renderXmlTree(xmlString, $container) {
        $container.empty();

        try {
            const xmlData = this.xmlToJson(xmlString);
            if (xmlData.error) {
                $container.html(`<span class="text-danger">${xmlData.error}</span>`);
                return;
            }

            function renderNode(node, $parentElement, nodeName = '') {
                const isObject = typeof node === 'object' && node !== null;
                const isCollapsible = isObject && (!node.value || Object.keys(node).length > 1);

                // 创建节点容器
                const $nodeContainer = $('<div>').addClass('mb-1');

                // 创建节点标题
                const $nodeHeader = $('<div>').addClass('flex items-center');

                // 如果是可折叠的，添加折叠按钮
                if (isCollapsible) {
                    const $toggleBtn = $('<button>')
                        .addClass('mr-1 text-gray-500 hover:text-gray-700 focus:outline-none')
                        .html('<i class="fa fa-minus-square-o"></i>')
                        .on('click', function() {
                            const isExpanded = $childContainer.css('display') !== 'none';
                            $childContainer.toggle(!isExpanded);
                            $(this).html(isExpanded ?
                                '<i class="fa fa-plus-square-o"></i>' :
                                '<i class="fa fa-minus-square-o"></i>');
                        });
                    $nodeHeader.append($toggleBtn);
                } else {
                    // 添加占位空间，保持对齐
                    $nodeHeader.append('<span class="mr-1"></span>');
                }

                // 添加节点名称
                if (nodeName) {
                    $nodeHeader.append(`<span class="tree-key">&lt;${nodeName}&gt;</span>`);

                    // 显示属性
                    if (node.attributes) {
                        Object.entries(node.attributes).forEach(([key, value]) => {
                            $nodeHeader.append(` <span class="text-purple-500">${key}="${value}"</span>`);
                        });
                    }
                }

                // 如果有文本值，显示值
                if (node.value && (!isCollapsible || Object.keys(node).length === 1)) {
                    $nodeHeader.append(` <span class="tree-string">${node.value}</span>`);
                }

                $nodeContainer.append($nodeHeader);

                // 如果是可折叠的，添加子节点容器
                let $childContainer;
                if (isCollapsible) {
                    $childContainer = $('<div>').addClass('tree-node');
                    $nodeContainer.append($childContainer);

                    // 渲染子节点（排除属性和值）
                    Object.entries(node).forEach(([key, value]) => {
                        if (key !== 'attributes' && key !== 'value') {
                            if (Array.isArray(value)) {
                                value.forEach(item => renderNode(item, $childContainer, key));
                            } else {
                                renderNode(value, $childContainer, key);
                            }
                        }
                    });
                }

                $parentElement.append($nodeContainer);
            }

            renderNode(xmlData.data, $container, xmlData.name);
        } catch (error) {
            $container.html(`<span class="text-danger">${error.message}</span>`);
        }
    },

    // 生成当前时间戳
    getCurrentTimestamp() {
        const now = new Date();
        return {
            seconds: Math.floor(now.getTime() / 1000),
            milliseconds: now.getTime()
        };
    },

    // 更新当前时间戳和时间
    updateCurrentTimestamp() {
        const timestamp = Utils.getCurrentTimestamp();
        const now = new Date();

        // 更新时间戳
        $('#current-timestamp').text(timestamp.seconds);
        $('#current-timestamp-ms').text(timestamp.milliseconds);

        // 更新当前时间显示
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const currentTimeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        $('#current-time').text(currentTimeStr);
    },

    // 时间戳转日期
    timestampToDate(timestamp) {
        try {
            // 处理毫秒级时间戳
            if (timestamp.toString().length > 10) {
                timestamp = parseInt(timestamp) / 1000;
            }

            const date = new Date(parseInt(timestamp) * 1000);
            if (isNaN(date.getTime())) {
                return { error: LanguageManager.getText('invalid-timestamp') };
            }

            return {
                date: date,
                iso: date.toISOString(),
                local: date.toLocaleString(),
                utc: date.toUTCString()
            };
        } catch (e) {
            return { error: e.message };
        }
    },

    // 日期转时间戳
    dateToTimestamp(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return { error: LanguageManager.getText('invalid-date') };
            }

            return {
                seconds: Math.floor(date.getTime() / 1000),
                milliseconds: date.getTime()
            };
        } catch (e) {
            return { error: e.message };
        }
    },

    // 历史记录管理
    historyManager: {
        // 获取历史记录
        getHistory(type) {
            const key = `devtoolbox_history_${type}`;
            const history = localStorage.getItem(key);
            return history ? JSON.parse(history) : [];
        },

        // 保存历史记录
        saveHistory(type, content) {
            if (!content || !content.trim()) return;

            const key = `devtoolbox_history_${type}`;
            let history = this.getHistory(type);

            // 创建新记录
            const newRecord = {
                id: Date.now(),
                content: content,
                preview: this.generatePreview(content),
                timestamp: new Date().toISOString()
            };

            // 检查是否重复
            const isDuplicate = history.some(record =>
                record.content === content ||
                this.formatContent(record.content) === this.formatContent(content)
            );

            if (isDuplicate) {
                // 如果重复，移除旧记录
                history = history.filter(record =>
                    record.content !== content &&
                    this.formatContent(record.content) !== this.formatContent(content)
                );
            }

            // 添加新记录到开头
            history.unshift(newRecord);

            // 保持最多10条记录
            if (history.length > 10) {
                history = history.slice(0, 10);
            }

            localStorage.setItem(key, JSON.stringify(history));
        },

        // 删除历史记录
        deleteHistory(type, id) {
            const key = `devtoolbox_history_${type}`;
            let history = this.getHistory(type);
            history = history.filter(record => record.id !== id);
            localStorage.setItem(key, JSON.stringify(history));
        },

        // 清空历史记录
        clearHistory(type) {
            const key = `devtoolbox_history_${type}`;
            localStorage.removeItem(key);
        },

        // 生成预览文本
        generatePreview(content) {
            try {
                // 尝试解析并格式化内容
                if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                    const parsed = JSON.parse(content);
                    return JSON.stringify(parsed, null, 2).substring(0, 100) + '...';
                }
                // 对于XML或其他内容，直接截取
                return content.substring(0, 100) + (content.length > 100 ? '...' : '');
            } catch (e) {
                // 如果解析失败，直接截取
                return content.substring(0, 100) + (content.length > 100 ? '...' : '');
            }
        },

        // 格式化内容用于比较
        formatContent(content) {
            try {
                // 移除空白字符后比较
                return content.replace(/\s+/g, ' ').trim();
            } catch (e) {
                return content;
            }
        },

        // 格式化时间显示
        formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return '刚刚';
            if (diffMins < 60) return `${diffMins}分钟前`;
            if (diffHours < 24) return `${diffHours}小时前`;
            if (diffDays < 7) return `${diffDays}天前`;

            return date.toLocaleDateString();
        }
    },

    // 显示历史记录模态框
    showHistoryModal(type) {
        const $modal = $('#history-modal');
        const $historyList = $('#history-list');
        const $historyEmpty = $('#history-empty');

        // 获取历史记录
        const history = this.historyManager.getHistory(type);

        // 清空列表
        $historyList.empty();

        if (history.length === 0) {
            $historyEmpty.show();
            $historyList.hide();
        } else {
            $historyEmpty.hide();
            $historyList.show();

            // 渲染历史记录
            history.forEach(record => {
                const $item = this.createHistoryItem(record, type);
                $historyList.append($item);
            });
        }

        // 显示模态框
        $modal.css('display', 'flex');
    },

    // 创建历史记录项
    createHistoryItem(record, type) {
        const $item = $(`
            <div class="history-item" data-id="${record.id}" data-type="${type}">
                <div class="history-item-header">
                    <div style="flex: 1; min-width: 0;">
                        <div class="history-item-preview">${this.escapeHtml(record.preview)}</div>
                        <div class="history-item-time">${this.historyManager.formatTime(record.timestamp)}</div>
                    </div>
                    <div class="history-item-actions">
                        <button class="history-action-btn copy-btn" data-id="${record.id}" data-type="${type}">
                            <i class="fa fa-copy"></i>
                            复制
                        </button>
                        <button class="history-action-btn history-delete-btn delete-btn" data-id="${record.id}" data-type="${type}">
                            <i class="fa fa-trash"></i>
                            删除
                        </button>
                    </div>
                </div>
                <div class="history-item-content">${this.escapeHtml(record.content)}</div>
            </div>
        `);

        // 点击展开/收起
        $item.on('click', function(e) {
            // 如果点击的是按钮，不触发展开/收起
            if ($(e.target).closest('.history-action-btn').length > 0) {
                return;
            }
            $item.toggleClass('expanded');
        });

        return $item;
    },

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 全局函数供HTML调用
function closeHistoryModal() {
    $('#history-modal').css('display', 'none');
}

// 点击模态框外部关闭
$(document).on('click', function(e) {
    if ($(e.target).is('#history-modal')) {
        closeHistoryModal();
    }
});

// 显示快速提示（用于历史记录复制）
function showQuickToast(message, buttonElement) {
    // 创建提示元素
    const $toast = $(`<div style="
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--secondary);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        white-space: nowrap;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">${message}</div>`);

    // 添加到按钮的父容器中
    $(buttonElement).parent().css('position', 'relative');
    $(buttonElement).parent().append($toast);

    // 300毫秒后移除
    setTimeout(() => {
        $toast.fadeOut(100, function() {
            $(this).remove();
        });
    }, 300);
}

// 使用事件委托处理复制按钮点击
$(document).on('click', '.copy-btn', function(e) {
    e.stopPropagation();
    const id = $(this).data('id');
    const type = $(this).data('type');
    const history = Utils.historyManager.getHistory(type);
    const record = history.find(r => r.id === parseInt(id));
    if (record) {
        Utils.copyToClipboard(record.content);
        showQuickToast('已复制', this);
    }
});

// 使用事件委托处理删除按钮点击
$(document).on('click', '.delete-btn', function(e) {
    e.stopPropagation();
    const id = $(this).data('id');
    const type = $(this).data('type');
    Utils.historyManager.deleteHistory(type, parseInt(id));
    Utils.showHistoryModal(type); // 刷新列表
});