# DevToolBox 项目重构说明

## 项目结构

```
pages/
├── assets/
│   ├── components/          # HTML组件
│   │   ├── global.html     # 全局组件（语言切换、加载器、通知）
│   │   ├── header.html     # 头部组件
│   │   ├── sidebar.html    # 侧边栏组件
│   │   ├── json-tool.html  # JSON工具组件
│   │   ├── xml-tool.html   # XML工具组件
│   │   └── timestamp-tool.html  # 时间戳工具组件
│   ├── css/                # 样式文件
│   │   └── common.css      # 公共样式
│   └── js/                 # JavaScript模块
│       ├── i18n.js         # 国际化模块
│       ├── utils.js        # 工具函数模块
│       ├── navigation.js   # 导航模块
│       ├── tools.js        # 工具功能模块
│       ├── app.js          # 主应用模块
│       └── modules.js      # 模块加载器
├── index.html              # 主页面
├── index-backup.html       # 原始文件备份
└── test.html               # 测试页面
```

## 重构亮点

### 1. 模块化架构
- **HTML组件化**：将页面拆分为可复用的组件
- **CSS模块化**：提取公共样式，使用Tailwind CSS
- **JavaScript模块化**：按功能拆分为独立模块

### 2. 代码组织
- **清晰的目录结构**：按文件类型和功能组织
- **命名规范**：统一的文件和函数命名
- **模块职责分离**：每个模块专注特定功能

### 3. 可维护性
- **组件化开发**：易于添加新工具和修改现有功能
- **模块独立**：减少代码耦合，便于测试和维护
- **样式统一**：使用CSS类和Tailwind工具类

### 4. 性能优化
- **按需加载**：HTML组件动态加载
- **资源优化**：分离CSS和JavaScript文件
- **缓存友好**：静态资源可以单独缓存

## 功能模块说明

### 国际化模块 (i18n.js)
- 支持中英文切换
- 集中管理语言包
- 动态更新界面文本

### 工具函数模块 (utils.js)
- 通用工具函数
- JSON处理
- XML处理
- 时间戳转换
- UI交互辅助

### 导航模块 (navigation.js)
- 侧边栏管理
- 工具切换
- 响应式设计
- 语言切换事件

### 工具功能模块 (tools.js)
- JSON工具：格式化、压缩、验证
- XML工具：格式化、压缩、验证
- 时间戳工具：时间戳与日期转换

### 主应用模块 (app.js)
- 应用初始化
- 模块协调
- 全局状态管理

## 使用说明

### 开发环境
1. 使用本地服务器运行（避免跨域问题）
2. 访问 `index.html` 查看主页面
3. 访问 `test.html` 进行功能测试

### 添加新工具
1. 在 `assets/components/` 创建新的工具组件
2. 在 `tools.js` 中添加对应的工具模块
3. 在 `index.html` 中添加组件容器
4. 更新导航菜单

### 修改样式
1. 编辑 `assets/css/common.css`
2. 使用Tailwind CSS类名
3. 遵循现有命名规范

## 技术栈

- **前端框架**：jQuery
- **样式框架**：Tailwind CSS
- **图标库**：Font Awesome
- **架构模式**：模块化设计
- **开发理念**：组件化、可维护、可扩展

## 注意事项

1. 需要网络连接加载CDN资源
2. 建议使用现代浏览器运行
3. 组件加载依赖于jQuery的AJAX功能
4. 所有工具功能都已模块化，可以独立使用