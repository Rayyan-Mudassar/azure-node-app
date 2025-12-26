import express from "express";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const app = express();
const port = process.env.PORT || 3000;

const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const containerName = "app-data";
const blobName = "sample.txt";

const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  `https://${storageAccountName}.blob.core.windows.net`,
  credential
);

app.get("/", async (req, res) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const download = await blobClient.download();
    const text = await streamToText(download.readableStreamBody);

    res.send(`
      <h1>Azure App Service (Windows) 🚀</h1>
      <pre>${text}</pre>
      <p>Accessed securely using Managed Identity</p>
    `);
  } catch (err) {
    res.status(500).send(`<pre>${err.message}</pre>`);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

function streamToText(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (d) => chunks.push(d.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}
