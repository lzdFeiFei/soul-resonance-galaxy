# 大模型接入指南

## 快速开始

项目默认使用mock数据运行，无需配置即可体验。要接入真实大模型，请按以下步骤操作：

## 1. 获取API密钥

选择一个或多个大模型提供商，获取API密钥：

### 国际模型
- **OpenAI GPT-4**: [获取API密钥](https://platform.openai.com/api-keys)
- **Anthropic Claude**: [获取API密钥](https://console.anthropic.com/account/keys)
- **Google Gemini**: [获取API密钥](https://makersuite.google.com/app/apikey)

### 国内模型
- **通义千问**: [获取API密钥](https://dashscope.console.aliyun.com/apiKey)
- **智谱AI GLM-4**: [获取API密钥](https://open.bigmodel.cn/usercenter/apikeys)
- **百度文心一言**: [获取API密钥](https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application)

## 2. 配置环境变量

1. 打开项目根目录的 `.env.local` 文件
2. 将你的API密钥填入对应的位置：

```env
# OpenAI配置
VITE_OPENAI_API_KEY=sk-your-api-key-here

# 或者使用其他提供商
VITE_QWEN_API_KEY=sk-your-qwen-key-here
```

3. 保存文件并重启开发服务器：
```bash
npm run dev
```

## 3. 在应用中切换模型

1. 点击右上角的设置按钮 ⚙️
2. 选择"在线模式"
3. 选择你配置好的模型提供商
4. 开始使用！

## 功能特性

### 智能响应格式
- **对话模式**: AI以哲学对话形式回应
- **诗歌模式**: AI创作现代诗回应
- **自动选择**: 系统根据输入内容智能选择最佳格式

### 情感分析
系统会分析用户输入的情感基调，并生成对应的"灵魂频率"：
- 沉思 (Contemplative): 432Hz
- 忧郁 (Melancholic): 396Hz
- 希望 (Hopeful): 528Hz
- 热情 (Passionate): 639Hz

### 错误处理
- **自动重试**: API调用失败时自动重试3次
- **降级机制**: 调试模式下，API失败会自动降级到mock数据
- **错误提示**: 清晰的错误提示和解决方案

## 高级配置

### 使用自定义API端点

如果你使用API代理或私有部署，可以修改base URL：

```env
VITE_OPENAI_BASE_URL=https://your-proxy.com/v1
```

### 调整模型参数

在 `src/services/llm/index.ts` 中可以调整：
- `maxTokens`: 最大生成长度
- `temperature`: 创造性程度 (0-1)
- `topP`: 采样参数

### 添加新的模型提供商

1. 在 `src/services/llm/providers/` 创建新的provider类
2. 继承 `LLMProvider` 基类
3. 实现 `sendRequest` 方法
4. 在 `src/services/llm/index.ts` 中注册

## 常见问题

### Q: 为什么设置了API密钥还是显示"需要配置API密钥"？
A: 请确保：
1. 密钥格式正确（不要有多余空格）
2. 重启了开发服务器
3. 环境变量前缀是 `VITE_`

### Q: API调用很慢怎么办？
A: 可以尝试：
1. 切换到其他模型提供商
2. 使用国内模型（如通义千问）
3. 调整超时时间 `VITE_API_TIMEOUT`

### Q: 如何查看API调用日志？
A: 打开浏览器控制台，所有API调用都会记录在console中

## 安全提醒

⚠️ **重要安全提示**：
- 不要将 `.env.local` 文件提交到Git
- 不要在前端代码中硬编码API密钥
- 生产环境建议使用后端代理API调用

## 支持

遇到问题？
- 查看控制台错误信息
- 检查网络连接
- 确认API密钥有效且有余额
- 尝试切换到mock模式排查问题