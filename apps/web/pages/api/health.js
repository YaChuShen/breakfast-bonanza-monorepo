// 健康檢查 API 路由
export default function handler(req, res) {
  // 設定回應超時
  res.setTimeout(10000, () => {
    res.status(504).json({ error: 'Request timeout' });
  });

  try {
    // 簡單的健康檢查
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'API is working correctly',
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
