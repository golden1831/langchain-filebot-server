const mongoose = require("mongoose");
const File = require("../models/File.model");

const { Document } = require("langchain/document");

const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const { JSONLoader, JSONLinesLoader } = "langchain/document_loaders/fs/json";
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");

// const { TokenTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("@langchain/openai");

const {
  TokenTextSplitter,
  CharacterTextSplitter,
} = require("langchain/text_splitter");

const { PineconeStore } = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
// const {
//   CheerioWebBaseLoader,
// } = require("langchain/document_loaders/web/cheerio");
const pdfParse = require("pdf-parse");
const { isEmpty } = require("lodash");
const fs = require("fs");
const path = require("path");

const getSource = async (req, res) => {
  try {
    const { userId } = req;

    let fileData = await File.find(
      { user_id: userId },
      { original_name: 1, status: 1 }
    );

    return res.status(200).json({
      // websites: websiteData,
      files: fileData,
      message: "Success!",
    });
  } catch (err) {
    console.log(err);
  }
};

const fileLoader = (file) => {
  const extension = path.extname(file.original_name);
  // console.log(extension);
  switch (extension) {
    case ".pdf":
      return new PDFLoader(`${file.path}/${file.name}`, {
        splitPages: false,
        pdfjs: () => import("pdf-parse/lib/pdf.js/v1.9.426/build/pdf.js"),
      });
    case ".docx":
      return new DocxLoader(`${file.path}/${file.name}`);
    case ".csv":
      return new CSVLoader(`${file.path}/${file.name}`);
    case ".txt":
      return new TextLoader(`${file.path}/${file.name}`);
  }
};

const embedSource = async (req, res) => {
  try {
    const { userId } = req;

    const fileData = await File.find({ user_id: userId, status: 0 });
    // const settingData = await Setting.findById(id);

    // const { openaiKey } = settingData;
    // if (isEmpty(openaiKey)) {
    //   return res.status(404).json({ message: "Input OpenAI Key!" });
    // } else {
    let textData = [];
    let metaData = [];
    // let siteTextData = [];
    // let siteMetaData = [];

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    // await pineconeIndex.delete1({ deleteAll: true, namespace: `${id}` });

    await Promise.all(
      fileData.map(async (file, idx) => {
        // const extension = path.extname(file.original_name);
        // const loader = new PDFLoader(`${file.path}/${file.name}`, {
        //   splitPages: false,
        //   pdfjs: () => import("pdf-parse/lib/pdf.js/v1.9.426/build/pdf.js"),
        // });
        const loader = fileLoader(file);
        const docs = await loader.load();
        console.log(docs);
        // const splitter = new TokenTextSplitter({
        //   encodingName: "gpt2",
        //   chunkSize: 500,
        //   chunkOverlap: 0,
        // });
        const splitter = new CharacterTextSplitter({
          separator: " ",
          chunkSize: 2000,
          chunkOverlap: 100,
        });

        const output = await splitter.createDocuments([docs[0].pageContent]);

        textData = textData.concat(output.map((item) => item.pageContent));
        let fileVector = [];
        output.map((item, idv) => {
          fileVector.push({
            id: `${file._id}`,
            type: "file",
            ...item.metadata,
          });
        });

        metaData = metaData.concat(fileVector);

        fs.unlinkSync(`${file.path}/${file.name}`);
      })
    );

    await PineconeStore.fromTexts(
      textData,
      metaData,
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }),
      { pineconeIndex, namespace: `${userId}` }
    );
    await File.updateMany(
      { user_id: userId, status: 0 },
      { $set: { status: 1 } }
    );

    return res.status(200).json({ message: "Update Knowledge" });
  } catch (err) {
    return res.status(ServerError).json({
      message: err.message || ServerErrorMsg,
    });
  }
};

module.exports = {
  getSource,
  embedSource,
};
