# 🚀 魔搭社区 ModelScope 接入指南

## 什么是魔搭社区？

魔搭社区（ModelScope）是阿里巴巴达摩院推出的AI模型社区平台，提供了丰富的大语言模型API，包括：
- 通义千问系列（Qwen）
- 其他开源模型

**优势**：
✅ 阿里云官方服务，稳定可靠  
✅ 国内直连，速度快  
✅ 支持多种模型选择  
✅ 价格实惠，有免费额度  

## 📝 获取API密钥

### 方式一：通过阿里云DashScope（推荐）

1. 访问阿里云DashScope控制台：[https://dashscope.console.aliyun.com](https://dashscope.console.aliyun.com)

2. 如果没有阿里云账号，需要先注册（支持支付宝快速登录）

3. 进入控制台后，点击左侧【API-KEY管理】

4. 点击【创建新的API-KEY】

5. 复制生成的API Key（格式：`sk-xxxxxxxxxxxxxxxxx`）

### 方式二：通过魔搭社区

1. 访问魔搭社区：[https://modelscope.cn](https://modelscope.cn)

2. 注册/登录账号

3. 进入个人中心 → API密钥管理

4. 创建并复制API密钥

## ⚙️ 配置项目

在 `.env.local` 文件中添加你的API密钥：

```env
# 魔搭社区配置（阿里云DashScope）
VITE_MODELSCOPE_API_KEY=sk-你的密钥
VITE_MODELSCOPE_MODEL=qwen-max
VITE_MODELSCOPE_BASE_URL=https://dashscope.aliyuncs.com

# 设置魔搭为默认模型（可选）
VITE_DEFAULT_PROVIDER=modelscope
```

## 🎯 可用模型

| 模型名称 | 模型ID | 特点 | 适用场景 |
|---------|--------|------|---------|
| 通义千问Max | qwen-max | 最强能力，效果最好 | 复杂任务 |
| 通义千问Plus | qwen-plus | 平衡性能与成本 | 日常使用 |
| 通义千问Turbo | qwen-turbo | 速度快，成本低 | 简单任务 |
| 通义千问Long | qwen-max-longcontext | 支持30万字长文本 | 长文处理 |

### 切换模型

修改 `.env.local` 中的 `VITE_MODELSCOPE_MODEL`：

```env
# 使用更快的模型
VITE_MODELSCOPE_MODEL=qwen-turbo

# 使用长文本模型
VITE_MODELSCOPE_MODEL=qwen-max-longcontext
```

## 💰 计费说明

### 免费额度
- 新用户有一定的免费调用额度
- 通义千问系列价格很便宜，约 0.008元/千tokens

### 查看用量
登录 [DashScope控制台](https://dashscope.console.aliyun.com) 查看API调用量和费用

## 🔧 高级配置

### 自定义参数

在 `src/services/llm/providers/modelscope.ts` 中调整：

```typescript
parameters: {
  max_tokens: 1000,      // 最大生成长度
  temperature: 0.7,      // 创造性 (0-1)
  top_p: 0.9,           // 核采样
  enable_search: true    // 开启搜索增强（可选）
}
```

### 搜索增强功能

通义千问支持实时搜索增强，可以获取最新信息：

```typescript
parameters: {
  enable_search: true,  // 开启搜索
  // AI会自动搜索相关信息并结合到回答中
}
```

## 🎉 开始使用

1. 重启开发服务器
2. 访问应用：http://localhost:5174
3. 点击右上角设置按钮 ⚙️
4. 选择"在线模式" → "魔搭社区"
5. 开始对话！

## ❓ 常见问题

### Q: 提示"API密钥无效"？
A: 检查：
- 密钥是否正确复制（以 `sk-` 开头）
- 是否在DashScope控制台激活了相应的模型服务
- 账户是否有余额或免费额度

### Q: 调用速度慢？
A: 可以尝试：
- 切换到 `qwen-turbo` 模型（速度更快）
- 检查网络连接
- 减少 `max_tokens` 参数

### Q: 如何开通更多模型？
A: 登录DashScope控制台，在【模型广场】中开通需要的模型服务

### Q: 支持哪些功能？
A: 
- ✅ 文本生成
- ✅ 多轮对话
- ✅ 搜索增强（可选）
- ✅ 流式输出（需要额外配置）

## 📊 监控与调试

在浏览器控制台查看：
- API请求详情
- Token使用量
- 响应时间
- 错误信息

## 🔗 相关链接

- [DashScope官方文档](https://help.aliyun.com/zh/dashscope/)
- [通义千问模型介绍](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)
- [价格说明](https://help.aliyun.com/zh/dashscope/developer-reference/billing)
- [魔搭社区](https://modelscope.cn)

## 💡 提示

- 通义千问对中文的理解和生成效果特别好
- 可以根据需求在不同模型间切换
- 建议先用免费额度测试，满意后再充值使用