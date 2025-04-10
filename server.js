const express = require('express');
const path = require('path');
const app = express();

const port = 443;
const host = '160.251.181.210';

// publicフォルダ内の静的ファイルを配信
app.use(express.static(path.join(__dirname, 'public')));

// 指定したIPアドレスとポートでサーバーを起動
app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
