# WA 五笔公开词库

- 行政区划来自 [86 五笔极点词库](https://github.com/KyleBing/rime-wubi86-jidian/tree/4d08110b8080f6577dad733ada7e5ae5c5e878fd)，保留词与编码，移除行政编码注释。见 `LICENSE-JIDIAN.txt`。
- 计算机和医学词来自 [THUOCL](https://github.com/thunlp/THUOCL/tree/a30ce79d895d01ab5132a5c74c29703ff7efb4cc)。见 `LICENSE-THUOCL.txt`。五笔编码由构建脚本根据 86 规则和 [Rime 五笔单字码](https://github.com/rime/rime-wubi/tree/152a0d3f3efe40cae216d1e3b338242446848d07) 生成。随附相应 LGPL 与 GPL 条款。
- `catalog.json` 提供包 ID、版号、文件名及 SHA-256。客户端下载完成并核对校验值后才更新本地词库。
