// json-server를 커스텀 부팅 - body 사이즈 제한을 50mb로 상향
// (기본 1mb에서는 AI 표지 base64 데이터 URI(2~3MB) POST가 거부됨)
const jsonServer = require('json-server');
const bodyParser = require('body-parser');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(bodyParser.json({ limit: '50mb' }));
server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
server.use(middlewares);
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server running on http://localhost:${PORT}`);
});
