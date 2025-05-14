require('dotenv').config();
const AWS = require('./awsConfig'); // Asegúrate de que esta ruta sea correcta

const s3 = new AWS.S3();

s3.listBuckets((err, data) => {
  if (err) {
    console.error("❌ Error al listar los buckets:", err);
  } else {
    console.log("✅ Buckets disponibles en tu cuenta AWS:");
    data.Buckets.forEach((bucket) => {
      console.log("🪣", bucket.Name);
    });
  }
});
