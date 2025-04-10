const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const port = 443;
const host = '160.251.181.210';

// Cloudflareオリジン証明書とプライベートキーの読み込み（pem形式／key形式）
const options = {
  key: fs.readFileSync(path.join(__dirname, 'origin-key.key')),
  cert: fs.readFileSync(path.join(__dirname, 'origin-cert.pem'))
};

// publicフォルダ内の静的ファイルを配信
app.use(express.static(path.join(__dirname, 'public')));

// HTTPSサーバーを起動
https.createServer(options, app).listen(port, host, () => {
  console.log(`HTTPS server running at https://${host}:${port}`);
});
