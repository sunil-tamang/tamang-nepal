"""Check every generated page, local navigation target, asset, and fragment."""
from pathlib import Path
from urllib.parse import urlsplit, unquote
from html.parser import HTMLParser
import json
import re

import argparse
parser = argparse.ArgumentParser()
parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1] / 'dist')
parser.add_argument('--baseurl', default='')
args = parser.parse_args()
root = args.root.resolve()
baseurl = args.baseurl.rstrip('/')

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.ids = set()
        self.refs = []
        self.headings = 0
        self.title = False
        self.robots = False
        self.in_json = False
        self.json_buffers = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            assert a['id'] not in self.ids, f'Duplicate id: {self.path}:{a["id"]}'
            self.ids.add(a['id'])
        if tag == 'h1': self.headings += 1
        if tag == 'title': self.title = True
        if tag == 'meta' and a.get('name') == 'robots': self.robots = 'noindex' in a.get('content', '')
        if tag in ['img', 'script'] and a.get('src'): self.refs.append(a['src'])
        if tag in ['a', 'link'] and a.get('href'): self.refs.append(a['href'])
        if tag == 'img': assert 'alt' in a, f'Missing alt: {self.path}'
        if tag == 'script' and a.get('type') == 'application/json': self.in_json = True
    def handle_endtag(self, tag):
        if tag == 'script': self.in_json = False
    def handle_data(self, data):
        if self.in_json: self.json_buffers.append(data)

pages = {}
for path in sorted(root.rglob('*.html')):
    p = Page(path)
    source = path.read_text()
    assert not re.search(r'{[{%]', source), f'Unrendered Liquid: {path}'
    p.feed(source)
    assert p.headings == 1, f'Expected one h1: {path} ({p.headings})'
    assert p.title and p.robots, f'Missing title or noindex: {path}'
    for data in p.json_buffers: json.loads(data)
    pages[path.resolve()] = p

checked = 0
for path, p in pages.items():
    for ref in p.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc: continue
        url_path = unquote(url.path)
        if url_path.startswith('/') and baseurl:
            assert url_path == baseurl or url_path.startswith(baseurl + '/'), f'Missing baseurl: {path} -> {ref}'
            url_path = url_path[len(baseurl):] or '/'
        target = root / url_path.lstrip('/') if url_path.startswith('/') else path.parent / url_path
        if not url.path: target = path
        if target.is_dir(): target = target / 'index.html'
        assert target.exists(), f'Broken local target: {path} -> {ref}'
        if url.fragment and target.resolve() in pages:
            assert url.fragment in pages[target.resolve()].ids, f'Missing fragment: {path} -> {ref}'
        checked += 1
assert len(pages) == 21, f'Unexpected page count: {len(pages)}'
print(f'PASS: {len(pages)} generated pages; {checked} navigation, asset, and fragment targets; embedded JSON, headings, image alt text, noindex.')

# The identity is vectors only: no extra visible text under the wordmark.
import xml.etree.ElementTree as ET
logo = ET.parse(root / 'assets/images/tamang-logo.svg').getroot()
assert not logo.findall('.//{http://www.w3.org/2000/svg}text'), 'Extra logo text found'
assert 'Handmade in Nepal' not in (root / 'assets/images/tamang-logo.svg').read_text()
print('PASS: simplified TAMANG + mountain SVG; no extra text.')

# Font and background URLs are relative to each stylesheet, including on GitHub subpaths.
for css in root.rglob('*.css'):
    for value in re.findall(r'url\([\'\"]?([^\)\'\"]+)', css.read_text()):
        if value.startswith(('data:', 'http:', 'https:')): continue
        assert (css.parent / value).resolve().exists(), f'Broken CSS asset: {css} -> {value}'
for path,p in pages.items():
    source=path.read_text()
    if '<script type="application/json" id="product-data">' not in source: continue
    records=json.loads(re.search(r'<script type="application/json" id="product-data">(.*?)</script>',source,re.S).group(1))
    assert len(records)==4
    assert {r['slug'] for r in records} == {'tote-bag','laptop-cover','chalk-bag','toiletries-bag'}
print('PASS: CSS assets and fonts; only four current products in every page record.')
