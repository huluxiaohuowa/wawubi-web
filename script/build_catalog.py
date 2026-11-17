#!/usr/bin/env python3
"""Build the public dictionary catalog from fixed upstream revisions."""
import hashlib
import json
import pathlib
import urllib.request

RIME = "https://raw.githubusercontent.com/rime/rime-wubi/152a0d3f3efe40cae216d1e3b338242446848d07/"
JIDIAN = "https://raw.githubusercontent.com/KyleBing/rime-wubi86-jidian/4d08110b8080f6577dad733ada7e5ae5c5e878fd/"
THU = "https://raw.githubusercontent.com/thunlp/THUOCL/a30ce79d895d01ab5132a5c74c29703ff7efb4cc/"
OUTPUT = pathlib.Path(__file__).resolve().parents[1] / "dictionaries"

def read(url):
    with urllib.request.urlopen(url, timeout=25) as response:
        return response.read().decode("utf-8-sig")

def valid(code):
    return 1 <= len(code) <= 4 and code.isascii() and code.isalpha() and code.islower()

def read_stems():
    stems = {}
    for line in read(RIME + "wubi86.dict.yaml").splitlines():
        parts = line.split("\t")
        if len(parts) < 2 or len(parts[0]) != 1 or line.startswith("#") or not valid(parts[1]):
            continue
        word, code = parts[:2]
        stem = parts[3] if len(parts) > 3 and valid(parts[3]) else code
        if len(parts) > 3 and valid(parts[3]) or len(stem) > len(stems.get(word, "")):
            stems[word] = stem
    for key, word in zip("abcdefghijklmnopqrstuvwxy", "工子又大月土王目水日口田山已火之金白木禾立女人纟言"):
        stems[word] = key * 4
    return stems

def encode(word, stems):
    if any(char not in stems for char in word):
        return None
    codes = [stems[char] for char in word]
    if len(codes) == 1:
        return codes[0]
    if len(codes) == 2:
        return codes[0][:2] + codes[1][:2]
    if len(codes) == 3:
        return codes[0][0] + codes[1][0] + codes[2][:2]
    return "".join(code[0] for code in codes[:3] + codes[-1:])

def publish(items, identifier, name, version, source, rows):
    filename = identifier + ".tsv"
    payload = "".join(f"{word}\t{code}\t{weight}\n" for word, code, weight in rows).encode()
    if not payload:
        raise ValueError(f"Empty dictionary: {identifier}")
    (OUTPUT / filename).write_bytes(payload)
    items.append(dict(id=identifier, name=name, version=version, file=filename,
                      sha256=hashlib.sha256(payload).hexdigest(), source=source))
    print(f"{identifier}: {len(rows)}")

def main():
    OUTPUT.mkdir(exist_ok=True)
    items = []
    stems = read_stems()
    district = []
    for line in read(JIDIAN + "wubi86_jidian_extra_district.dict.yaml").splitlines():
        fields = line.split("\t")
        if len(fields) >= 2 and not line.startswith("#") and valid(fields[1]):
            district.append((fields[0], fields[1], 0))
    publish(items, "district", "行政区划", "4d08110", "https://github.com/KyleBing/rime-wubi86-jidian", district)
    categories = [
        ("it", "计算机", "IT"),
        ("medical", "医学", "medical"),
        ("idioms", "成语", "chengyu"),
        ("finance", "财经", "caijing"),
        ("law", "法律", "law"),
        ("food", "饮食", "food"),
        ("places", "地名", "diming"),
        ("animals", "动物", "animal"),
        ("automotive", "汽车", "car"),
        ("historical-people", "历史人物", "lishimingren"),
        ("poetry", "诗词", "poem"),
    ]
    for identifier, name, filename in categories:
        rows = []
        for line in read(THU + "data/THUOCL_" + filename + ".txt").splitlines():
            fields = line.strip().split()
            if not fields:
                continue
            word = fields[0]
            code = encode(word, stems)
            if code and valid(code):
                weight = int(fields[1]) if len(fields) > 1 and fields[1].isdigit() else 0
                rows.append((word, code, weight))
        publish(items, identifier, name, "a30ce79-1", "https://github.com/thunlp/THUOCL", rows)
    (OUTPUT / "catalog.json").write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n")
    (OUTPUT / "LICENSE-THUOCL.txt").write_text(read(THU + "LICENSE"))
    (OUTPUT / "LICENSE-JIDIAN.txt").write_text(read(JIDIAN + "LICENSE"))

if __name__ == "__main__":
    main()
