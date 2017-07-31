
const cluster = require('cluster');

if (cluster.isMaster) {
  let workerCount = +(process.env.WEB_CONCURRENCY || 1);

  while (workerCount--) {
    cluster.fork();
  }

  cluster.on('exit', deadWorker => {
    let worker = cluster.fork();
    console.log(`Worker ${deadWorker.process.pid} replaced by ${worker.process.pid}`);
  });
} else {
  console.log(`Starting worker ${process.pid}`);
  require('./src').start();
}
