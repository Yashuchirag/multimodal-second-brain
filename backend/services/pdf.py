import io
import re
import asyncio
from typing import List, Tuple
from pypdf import PdfReader

MIN_PAGE_CHARS = 80


def _clean(text: str) -> str:
    # Strip C0/C1 control characters (keep \n and \t)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Collapse runs of horizontal whitespace to a single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Collapse 3+ blank lines to 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Drop lines that are mostly non-alphanumeric (garbled icon/glyph lines)
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            lines.append('')
            continue
        normal = sum(1 for c in stripped if c.isalnum() or c in ' .,;:!?-_()[]{}"\'/\\@#+=%&*<>')
        if len(stripped) <= 3 or normal / len(stripped) >= 0.4:
            lines.append(line)
    return '\n'.join(lines).strip()


def extract_pages(file_bytes: bytes) -> List[Tuple[int, str]]:
    """
    Parse a PDF and return (1-indexed page number, cleaned text) for every
    non-blank page. Runs synchronously — call via asyncio.to_thread.
    """
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        raw = (page.extract_text() or "").strip()
        text = _clean(raw)
        if len(text) >= MIN_PAGE_CHARS:
            pages.append((i + 1, text))
    return pages


async def extract_pages_async(file_bytes: bytes) -> List[Tuple[int, str]]:
    return await asyncio.to_thread(extract_pages, file_bytes)
