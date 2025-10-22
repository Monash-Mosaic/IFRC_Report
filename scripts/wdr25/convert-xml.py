#%%
# markdown_builder.py
# A minimal, chainable Markdown builder in Python.
# Dependency-free. Works in any Python 3.8+ environment.
# Design goals: readable API, correct Markdown output, safe escaping for common cases.

from dataclasses import dataclass
from typing import List, Iterable, Optional, Sequence, Union, Tuple
import re
from lxml import etree
from argparse import ArgumentParser

TableAlignment = Union[str]  # 'left' | 'center' | 'right'

def _escape_text(text: str) -> str:
    """
    Escape common Markdown meta characters for plain text contexts.
    Note: We do not escape inside code spans/blocks; pass raw code there.
    """
    return (
        text.replace("\\", "\\\\")
            .replace("*", "\\*")
            .replace("_", "\\_")
            .replace("#", "\\#")
            .replace("|", "\\|")
            .replace(">", "\\>")
    )

def _align_token(align: str) -> str:
    align = align.lower()
    if align == "center":
        return ":---:"
    if align == "right":
        return "---:"
    return ":---"  # default left

def _fence(lang: Optional[str]) -> str:
    return "```" + (lang or "")

def _normalise_text(text: str) -> str:
    """Normalize whitespace in text blocks."""
    return re.sub(r'\s+', ' ', text).strip()

@dataclass
class MarkdownBuilder:
    """_summary_

    Returns:
        _type_: _description_
    Example:
    >>> builder = MarkdownBuilder()
    >>> doc = (
    >>>     builder
    >>>     .title("Project Title")
    >>>     .subtitle("An example project using MarkdownBuilder")
    >>>     .h1("Project README")
    >>>     .paragraph("This document describes the project setup and usage.")
    >>>     .list(["Install dependencies", "Run dev server", "Build for production"], ordered=True)
    >>>     .code_block("pip install -r requirements.txt\nuvicorn app:app --reload", lang="bash")
    >>>     .table(
    >>>         headers=["Command", "Description"],
    >>>         rows=[
    >>>             ["pip install -r requirements.txt", "Install dependencies"],
    >>>             ["uvicorn app:app --reload", "Run dev server"],
    >>>             ["python -m build", "Build production artifacts"],
    >>>         ],
    >>>         align=["left", "left"]
    >>>     )
    >>>     .quote("“Done is better than perfect.” — Sheryl Sandberg")
    >>>     .hr()
    >>>     .paragraph("Links: ")  # Inline link next
    >>>     .link("Homepage", "https://example.com")
    >>> ).to_string()
    >>>  
    >>> print(doc)

    """

    _set_custom_components: set
    metadata: dict
    parts: List[str]

    def __init__(self) -> None:
        self.metadata = {}
        self.parts = []
        self._set_custom_components = set()

    def _sep(self) -> None:
        """Ensure a blank line between block elements when appropriate."""
        if self.parts and not self.parts[-1].endswith("\n\n"):
            self.parts.append("\n")

    def title(self, text: str) -> "MarkdownBuilder":
        text = _normalise_text(text)
        self.metadata['title'] = text
        return self

    def subtitle(self, text: str) -> "MarkdownBuilder":
        text = _normalise_text(text)
        self.metadata['subtitle'] = text        
        return self

    # Headings
    def h(self, level: int, text: str) -> "MarkdownBuilder":
        lvl = max(1, min(6, level))
        text = _normalise_text(text)
        self._sep()
        self.parts.append(f"{'#' * lvl} {_escape_text(text)}\n\n")
        return self

    def h1(self, text: str) -> "MarkdownBuilder": return self.h(1, text)
    def h2(self, text: str) -> "MarkdownBuilder": return self.h(2, text)
    def h3(self, text: str) -> "MarkdownBuilder": return self.h(3, text)

    # Paragraphs and inline formatting
    def paragraph(self, text: str) -> "MarkdownBuilder":
        self._sep()
        text = _normalise_text(text)
        self.parts.append(f"{_escape_text(text)}\n\n")
        return self

    def bold(self, text: str) -> "MarkdownBuilder":
        text = _normalise_text(text)
        self.parts.append(f"**{_escape_text(text)}**")
        return self

    def italic(self, text: str) -> "MarkdownBuilder":
        text = _normalise_text(text)
        self.parts.append(f"*{_escape_text(text)}*")
        return self

    def inline_code(self, code: str) -> "MarkdownBuilder":
        code = _normalise_text(code)
        safe = code.replace("`", "\\`")
        self.parts.append(f"`{safe}`")
        return self

    # Links and images
    def link(self, text: str, url: str) -> "MarkdownBuilder":
        text = _normalise_text(text)
        self.parts.append(f"[{_escape_text(text)}]({url})")
        return self

    def image(self, alt: str, url: str) -> "MarkdownBuilder":
        self._sep()
        self.parts.append(f"![{_escape_text(alt)}]({url})\n\n")
        return self

    # Quotes and horizontal rule
    def quote(self, text: str) -> "MarkdownBuilder":
        self._sep()
        lines = text.splitlines()
        quoted = "\n".join(f"> {_escape_text(l)}" for l in lines)
        self.parts.append(quoted + "\n\n")
        return self

    def hr(self) -> "MarkdownBuilder":
        self._sep()
        self.parts.append("---\n\n")
        return self

    # Lists
    def list(self, items: Iterable[str], ordered: bool = False) -> "MarkdownBuilder":
        self._sep()
        idx = 1
        any_item = False
        for item in items:
            any_item = True
            item = _normalise_text(item)
            if ordered:
                self.parts.append(f"{idx}. {_escape_text(item)}\n")
                idx += 1
            else:
                self.parts.append(f"- {_escape_text(item)}\n")
        if any_item:
            self.parts.append("\n")
        return self

    def checklist(self, items: Iterable[Tuple[str, bool]]) -> "MarkdownBuilder":
        self._sep()
        any_item = False
        for text, checked in items:
            any_item = True
            text = _normalise_text(text)
            self.parts.append(f"- [{'x' if checked else ' '}] {_escape_text(text)}\n")
        if any_item:
            self.parts.append("\n")
        return self

    # Code blocks
    def code_block(self, code: str, lang: Optional[str] = None) -> "MarkdownBuilder":
        self._sep()
        start = _fence(lang)
        end = "```"
        # Always place fences on their own lines
        self.parts.append(f"{start}\n{code}\n{end}\n\n")
        return self

    # Tables
    def table(self, headers: Sequence[str], rows: Sequence[Sequence[Union[str, int, float, None]]], align: Optional[Sequence[str]] = None) -> "MarkdownBuilder":
        self._sep()
        if not headers:
            return self
        # Header row
        hdr = " | ".join(_escape_text(str(h)) for h in headers)
        self.parts.append(f"| {hdr} |\n")
        # Alignment row
        aligns = align or ["left"] * len(headers)
        align_row = " | ".join(_align_token(a) for a in aligns)
        self.parts.append(f"| {align_row} |\n")
        # Data rows
        for row in rows:
            cells = []
            for i, cell in enumerate(row):
                val = "" if cell is None else str(cell)
                cells.append(_escape_text(val))
            self.parts.append(f"| {' | '.join(cells)} |\n")
        self.parts.append("\n")
        return self

    def sidenotes(self, content: str) -> "MarkdownBuilder":
        self.custom_components('SideNote', content)
        return self

    def small_quote(self, content: str) -> "MarkdownBuilder":
        self.custom_components('SmallQuote', content)
        return self

    def small_quote_author(self, content: str) -> "MarkdownBuilder":
        self.custom_components('SmallQuoteAuthor', content)
        return self

    def spotlight(self, content: str) -> "MarkdownBuilder":
        self.custom_components('Spotlight', content)
        return self

    def contributors(self, content: str) -> "MarkdownBuilder":
        self.custom_components('Contributors', content)
        return self

    def contributor_spotlight(self, name: str, role: str, position: str = None) -> "MarkdownBuilder":
        name = _normalise_text(name)
        role = _normalise_text(role)
        name_component = self._create_component('ContributorSpotlightName', name)
        role_component = self._create_component('ContributorSpotlightRole', role)
        inner_content = [name_component, role_component]
        if position:
            position_component = self._create_component('ContributorSpotlightPosition', position)
            inner_content.append(position_component)
        full_content = f"\n  {('\n  '.join(inner_content))}"
        self.custom_components('ContributorSpotlight', full_content)
        return self

    # Raw append (use sparingly)
    def raw(self, markdown: str) -> "MarkdownBuilder":
        self.parts.append(markdown)
        if not markdown.endswith("\n"):
            self.parts.append("\n")
        return self

    def custom_components(self, component: str, content: str, attrs: dict = {}) -> "MarkdownBuilder":
        self._sep()
        part = self._create_component(component, content, attrs)
        self.parts.append(part)
        return self

    def _create_component(self, component, content, attrs = {}):
        part = f"<{component}"
        for key, value in attrs.items():
            part += f' {key}="{value}"'
        part += ">"
        part += f"{content}</{component}>\n\n"
        self._set_custom_components.add(component)
        return part

    # Output
    def to_string(self) -> str:
        out = ""
        if self._set_custom_components:
            imports = ", ".join(sorted(self._set_custom_components))
            out += f"import {{ {imports} }} from '@/components/CustomComponents';\n\n"
        if self.metadata:
          for key, value in self.metadata.items():
              out += f"export const {key} = '{value}';\n"
        out += "\n"
        out += "".join(self.parts)
        # Trim excessive trailing newlines
        while out.endswith("\n\n\n"):
            out = out[:-1]
        return out

    def to_file(self, filepath: str) -> None:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(self.to_string())

def parse_xml_dom(xml_str: str) -> etree._Element:
    # Parses into an Element tree; child order is preserved.
    return etree.fromstring(xml_str.encode("utf-8"))

def convert_to_markdown(xml_el: etree._Element) -> Tuple[MarkdownBuilder, set]:
  builder = MarkdownBuilder()

  last_key = None
  last_values = []
  for e in list(xml_el):
      key = e.tag
      value = e.text or ''
      if last_key == 'numbered-list' and key != 'numbered-list':
          builder.list(last_values, ordered=True)
          last_key = None
          last_values.clear()

      if last_key == 'normal-spotlight-bullet-list' and key != 'normal-spotlight-bullet-list':
          builder.list(last_values, ordered=False)
          last_key = None
          last_values.clear()

      if last_key == 'sidenotes-contributions-2col' and key != 'sidenotes-contributions-2col':
          builder.sidenotes("".join(last_values))
          last_key = None
          last_values.clear()

      if last_key == 'contributor-name-spotlight' and key != 'contributor-position-spotlight':
          name = last_values[0]
          role = last_values[1]
          builder.contributor_spotlight(name, role)
          last_key = None
          last_values.clear()

      if last_key == 'contributor-position-spotlight' and key != 'contributor-position-spotlight':
          name = last_values[0]
          role = last_values[1]
          position = last_values[2]
          builder.contributor_spotlight(name, role, position)
          last_key = None
          last_values.clear()

      if key == 'chapter-title':
          builder.title(value)
      elif key == 'subchapter-title':
          builder.subtitle(value)
      elif key == 'numbered-list':
          last_key = 'numbered-list'
          last_values.append(value)
      elif key == 'normal-spotlight-bullet-list':
          last_key = 'normal-spotlight-bullet-list'
          last_values.append(value)
      elif key == 'sidenotes-contributions-2col':
          last_key = 'sidenotes-contributions-2col'
          last_values.append(value)

      elif key == 'h1-contributor-spotlight':
          last_key = 'h1-contributor-spotlight'
          last_values.append(value)
      elif key == 'contributor-name-spotlight':
          last_key = 'contributor-name-spotlight'
          last_values.append(value)
      elif key == 'contributor-position-spotlight':
          last_key = 'contributor-position-spotlight'
          last_values.append(value)

      elif key == 'chapter-quote':
          builder.quote("".join(value))
      elif key in ['introduction', 'normal']:
          builder.paragraph(re.sub(r'\s+', ' ', "".join(value)))
      elif key in ['h1', 'h1-c1', 'h1c2']:
          builder.h1(value)
      elif key in ['h2', 'h2c1', 'h2c2']:
          builder.h2(value)
      elif key in ['h3', 'h3c2', 'heading-3']:
          builder.h3(value)
      elif key == 'h1.fig':
          # TODO: What is the correct handling here?
          builder.h2(value)
      elif key in ['normal-first', 'normal-spotlight', 'normal-spotlight-first']:
          builder.paragraph(value)
      elif key in ['h1-contributor', 'contributor']:
          builder.contributors(value)
      elif key == 'contributor-role':
          builder.custom_components('ContributorRole', value)
      # TODO: NEED TO CONFIRM ON h1-sidenote-context and sidenotes-contributions-first since it confirmation bias
      elif key == 'h1-sidenote-context':
          builder.h1(value)
      elif key == 'sidenotes-contributions-first':
          builder.quote(re.sub(r'\s+', ' ', "".join(value)))
      elif key == 'sidenotes-contributions-first':
          builder.sidenotes(value)
      elif key == 'small-quote':
          builder.small_quote(value)
      elif key == 'small-quote-author':
          builder.small_quote_author(value)
      elif key == 'h1-spotlight':
          builder.spotlight(value)
      elif key == 'h1-ebn':
          # TODO: what to do here?
          continue
      elif key in ['toh', 'toh-next', 'img-4c']:
          continue  # skip
      else:
          print(f"Unhandled key: {key}")
  return builder

# %%
if __name__ == "__main__":
    parser = ArgumentParser(description="Convert WDR25 XML to Markdown")
    parser.add_argument("input_xml", help="Path to input XML file")
    parser.add_argument("output_md", help="Path to output Markdown file")
    parser.add_argument("--story-index", type=int, default=2, help="Index of story element (default: 2)")
    args = parser.parse_args()

    try:
        with open(args.input_xml, 'r', encoding='utf-8') as f:
            xml = f.read()
    except FileNotFoundError:
        print(f"Error: Input file '{args.input_xml}' not found.")
        exit(1)

    data = parse_xml_dom(xml)
    stories = list(data)
    if args.story_index < 0 or args.story_index >= len(stories):
        print(f"Error: story-index {args.story_index} is out of bounds (0..{len(stories)-1})")
        exit(1)
    story = stories[args.story_index]
    builder = convert_to_markdown(story)
    builder.to_file(args.output_md)
