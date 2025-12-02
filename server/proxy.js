import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 代理魔搭API请求
app.post('/api/modelscope/*', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const url = 'https://api-inference.modelscope.cn/v1/chat/completions';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error' });
  }
});

// 代理DashScope API请求（通义千问）
app.post('/api/dashscope/*', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error' });
  }
});

app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log('支持的端点:');
  console.log('  - POST /api/modelscope/* (魔搭社区)');
  console.log('  - POST /api/dashscope/* (阿里云DashScope)');
});