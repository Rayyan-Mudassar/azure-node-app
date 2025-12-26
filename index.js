import express from "express";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const app = express();
const port = process.env.PORT || 3000;

// CHANGE THESE
const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const containerName = "app-data";
const blobName = "sample.txt";

// Managed Identity credential
const credential = new DefaultAzureCredential();

// Storage URL
const blobServiceClient = new BlobServiceClient(
  `https://$(storageAccountName).blob.core.windows.net`,
  credential
);

app.get("/", async (req, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = await streamToText(
      downloadBlockBlobResponse.readableStreamBody
    );

    res.send(`
      <h1>Azure App Service is LIVE 🚀</h1>
      <p><strong>Storage content:</strong></p>
      <pre>${downloaded}</pre>
      <p>Accessed securely using <b>Managed Identity</b></p>
    `);
  } catch (err) {
    res.status(500).send(`
      <h1>Error accessing storage ❌</h1>
      <pre>${err.message}</pre>
    `);
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

async function streamToText(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}
