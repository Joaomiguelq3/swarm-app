const { speak } = require('../src/tts');

(async () => {
  const result = await speak('AVANT IA inicializado', { timeoutMs: 8000 });
  console.log(`tts result: ${JSON.stringify(result)}`);
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
