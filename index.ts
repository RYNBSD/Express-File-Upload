import express from "express";
import cors from "cors";
import multer from "multer";
import { writeFile } from "fs/promises";
import { cwd } from "process";
import { join } from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __root = cwd();
const publicDir = "public";
app.use(express.static(join(__root, publicDir)));

const upload = multer({ storage: multer.memoryStorage() });

app.post("/file", upload.single("file"), async (req, res) => {
    const { file } = req;
    if (file === undefined)
        return res.status(500).json({
            success: false,
        });

    // console.log("File: ", file);
    await writeFile(join(__root, publicDir, file.originalname), file.buffer);

    res.status(200).json({
        success: true,
    });
});

app.use("/files", upload.array("files"), async (req, res) => {
    const { files } = req;
    if (files === undefined || !(files instanceof Array))
        return res.status(500).json({
            success: false,
        });

    // console.log("File: ", req.file);
    // console.log("Files: ", files);

    await Promise.all(
        files.map(
            async (file) =>
                await writeFile(join(__root, publicDir, file.originalname), file.buffer)
        )
    );

    res.status(200).json({
        success: true,
    });
});

app.post("/none", upload.none(), async (req, res) => {
    console.log("File: ", req.file);
    console.log("Files: ", req.files);

    res.status(200).json({
        success: true,
    });
});

app.listen(3000, () => {
    console.info("Starting");
});
