import { promises as fs } from "fs";
import axios from "axios";
import { readIssueArchive } from "./scripts/weekly-content.js";

async function fetchCiTime(filePath) {
  const url = `https://api.github.com/repos/tw93/weekly/commits?path=${filePath}&page=1&per_page=1`;
  try {
    const response = await axios.get(url);
    const commitDate = response.data?.[0]?.commit?.committer?.date;
    return commitDate ? commitDate.split("T")[0] : null;
  } catch (error) {
    return null;
  }
}

async function main() {
  const readmeContent =
    "# 潮流周刊\n\n> 记录工程师 Tw93 的不枯燥生活，欢迎订阅，也欢迎 [推荐](https://github.com/tw93/weekly/discussions/22) 你的好东西，Fork 自用可见 [开发文档](https://github.com/tw93/weekly/blob/main/Deploy.md)，期待你玩得开心~\n\n";

  const archive = await readIssueArchive(
    "./src/pages/posts",
    "Chinese posts",
    2,
  );
  const posts = archive.map(({ post }) => post);
  let recentContent = "";
  let readmeContent2 = "";

  for (let i = 0; i < archive.length; i++) {
    const { filename: name, post } = archive[i];
    const filePath = encodeURIComponent(name);
    const { num, title: shortTitle, url } = post;
    const title = `第 ${num} 期 - ${shortTitle}`;
    const fullPath = `./src/pages/posts/${name}`;
    readmeContent2 += `* [${title}](${url})\n`;

    if (i < 5) {
      const modified =
        (await fetchCiTime(`/src/pages/posts/${filePath}`)) ||
        new Date((await fs.stat(fullPath)).mtime).toISOString().split("T")[0];
      recentContent += `* [${title}](${url}) - ${modified}\n`;
    }
  }

  await Promise.all([
    fs.writeFile("README.md", readmeContent + readmeContent2),
    fs.writeFile("RECENT.md", recentContent),
    fs.writeFile("public/posts.json", JSON.stringify(posts, null, 2)),
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
