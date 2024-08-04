const File = require("../models/file.model");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { TokenTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const env = require("dotenv").config();
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const isEmpty = require("is-empty");

const getPDF = async (file) => {
  let readFileSync = fs.readFileSync(file);
  try {
    let pdfExtract = await pdfParse(readFileSync);
    return pdfExtract.text.length;
  } catch (error) {
    throw new Error(error);
  }
};

exports.create = async (req, res) => {
  const bot_id = new mongoose.Types.ObjectId(req.params.id);

  if (isEmpty(req.files)) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }
  let token = req.headers["x-auth-token"];
  const decode = jwt.decode(token);
  let upload_len = req.files.reduce(
    async (sum, item) => sum + (await getPDF(item.path)),
    0
  );
  try {
    let textData = [];
    let metaData = [];

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    // await pineconeIndex.delete1({deleteAll: true, namespace: `${req.params.id}`});
    const partData = await File.aggregate([
      { $match: { chatbot_id: bot_id } },
      {
        $group: {
          _id: "$chatbot_id",
          total: { $sum: "$character_len" },
        },
      },
    ]);

    let leftNum = partData.length ? partData[0].total : 0;

    if (leftNum + upload_len > decode.character) {
      return res.status(400).json({ message: "The character is lack" });
    } else {
      req.files.forEach(async (item, idx) => {
        // let readFileSync = fs.readFileSync(
        //   `${item.destination}/${item.filename}`
        // );
        // let pdfExtract = await pdfParse(readFileSync);
        const file = {
          name: item.filename,
          original_name: item.originalname,
          path: item.destination,
          chatbot_id: req.params.id,
          isDeleted: false,
          character_len: await getPDF(item.path),
        };

        const data = await File.create(file);
        try {
          const loader = new PDFLoader(`${item.destination}/${item.filename}`, {
            splitPages: false,
            pdfjs: () => import("pdf-parse/lib/pdf.js/v1.9.426/build/pdf.js"),
          });
          const docs = await loader.load();
          const splitter = new TokenTextSplitter({
            chunkSize: 500,
            chunkOverlap: 0,
          });
          const output = await splitter.createDocuments([docs[0].pageContent]);
          textData = textData.concat(output.map((item) => item.pageContent));
          let fileVector = [];
          output.map((item, idv) => {
            fileVector.push({
              id: `${data._id}`,
              ...item.metadata,
            });
          });

          metaData = metaData.concat(fileVector);
          try {
            fs.unlinkSync(item.path);
            console.log("Delete file success");
          } catch (err) {
            console.log("Delete file error");
          }
          if (req.files.length - 1 === idx) {
            await PineconeStore.fromTexts(
              textData,
              metaData,
              new OpenAIEmbeddings({
                openAIApiKey: env.parsed.OPENAI_API_KEY,
              }),
              { pineconeIndex, namespace: `${req.params.id}` }
            );
            res.status(200).json({ message: "File uploaded successfully" });
          }
        } catch (error) {
          console.log(error);
        }
      });
    }
  } catch (error) {
    throw new Error(error);
  }
};

exports.delete = async (req, res) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
  const deleteRequest = {
    filter: { id: `${req.body.file}` },
    namespace: `${req.body.bot}`,
  };

  await pineconeIndex._delete({ deleteRequest });

  await File.findByIdAndDelete(req.body.file)
    .then((data) => {
      res.send({ message: "success" });
    })
    .catch((err) => {});
};
