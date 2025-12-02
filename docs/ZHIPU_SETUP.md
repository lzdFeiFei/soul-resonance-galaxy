# 🚀 智谱AI GLM-4 免费接入指南

## 为什么选择智谱AI？

✅ **完全免费额度** - 新用户赠送2500万tokens  
✅ **国内直连** - 无需科学上网，速度快  
✅ **性能优秀** - GLM-4模型效果媲美GPT-4  
✅ **中文优化** - 对中文理解和生成特别优化  

## 📝 注册步骤

### 1. 注册账号

访问智谱AI开放平台：[https://open.bigmodel.cn](https://open.bigmodel.cn)

点击右上角【注册】，使用手机号注册即可。

### 2. 获取API密钥

1. 登录后，点击右上角头像
2. 选择【API密钥】
3. 点击【创建新的API key】
4. 复制生成的密钥（格式类似：`xxxxxx.xxxxxxxxxxxxxxxx`）

### 3. 配置项目

打开项目根目录的 `.env.local` 文件，填入你的API密钥：

```env
# 智谱AI配置
VITE_ZHIPU_API_KEY=你的密钥.xxxxxxxxxxxxxxxx
VITE_ZHIPU_MODEL=glm-4
VITE_ZHIPU_BASE_URL=https://open.bigmodel.cn

# 设置智谱AI为默认模型
VITE_DEFAULT_PROVIDER=zhipu
```

### 4. 重启服务

保存文件后，在终端按 `Ctrl+C` 停止服务，然后重新运行：

```bash
npm run dev
```

## 🎯 测试连接

1. 打开应用 http://localhost:5173
2. 点击右上角设置按钮 ⚙️
3. 确认已切换到"在线模式"
4. 选择"智谱AI"作为模型提供商
5. 在输入框输入任意文字测试

## 💰 免费额度说明

### 新用户福利
- **赠送额度**: 2500万 tokens
- **有效期**: 1个月
- **使用限制**: 
  - GLM-4: 30次/分钟
  - 并发数: 5

### 额度计算
- 1次对话约消耗 500-1000 tokens
- 2500万tokens ≈ 25000-50000次对话
- 足够个人开发和测试使用

### 查看余额
访问 [控制台](https://open.bigmodel.cn/console/overview) 查看剩余额度

## 🔧 高级配置

### 调整模型参数

在 `src/services/llm/providers/zhipu.ts` 中可以调整：

```typescript
{
  model: 'glm-4',           // 可选: glm-4, glm-3-turbo
  temperature: 0.7,          // 创造性 (0-1)
  max_tokens: 1000,          // 最大生成长度
  top_p: 0.9                 // 核采样参数
}
```

### 可用模型

| 模型 | 特点 | 速度 | 费用 |
|-----|------|------|------|
| glm-4 | 最强能力，效果最好 | 较慢 | 免费额度可用 |
| glm-3-turbo | 速度快，效果好 | 快 | 免费额度可用 |
| glm-4v | 支持图像理解 | 慢 | 免费额度可用 |

## ❓ 常见问题

### Q: 提示"API密钥无效"？
**A:** 检查密钥格式是否正确，应该包含一个点号，如：`abc123.xyz456789`

### Q: 请求超时？
**A:** 智谱AI服务器在国内，一般不会超时。如果遇到，可能是：
- 服务器临时维护
- 并发请求过多
- 网络问题

### Q: 如何切换到其他模型？
**A:** 修改 `.env.local` 中的 `VITE_ZHIPU_MODEL`：
```env
VITE_ZHIPU_MODEL=glm-3-turbo  # 更快的模型
```

### Q: 额度用完了怎么办？
**A:** 
1. 可以充值继续使用（很便宜）
2. 或切换到mock模式继续体验
3. 或使用其他免费API（如通义千问）

## 📊 API调用监控

在浏览器控制台可以看到：
- 每次API调用的详情
- Token使用量
- 响应时间
- 错误信息

## 🎉 开始使用

配置完成！现在你可以：
1. 输入你的想法
2. AI会以诗意的方式回应
3. 保存喜欢的回应到星系
4. 探索其他人的灵感

## 📞 获取帮助

- 智谱AI文档：https://open.bigmodel.cn/dev/api
- 智谱AI社区：https://open.bigmodel.cn/community
- 项目Issue：在GitHub提交问题