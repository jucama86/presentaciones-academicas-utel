(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["@tiptap/vanilla-bundle"] = factory());
})(this, (function () {
  'use strict';

  var core = {};
core.Editor = class {
  constructor(options) {
    const { element, extensions, content, onTransaction } = options;
    this.element = element;
    this.extensions = extensions;
    this.content = content || "";
    this.onTransaction = onTransaction || (() => {});
    this.init();
  }

  init() {
    if (!this.element) throw new Error("Missing element for TipTap Editor");
    this.element.innerHTML = this.content;
    this.element.contentEditable = true;
    this.element.classList.add("tiptap");
    this.attachEvents();
  }

  attachEvents() {
    this.element.addEventListener("input", () => {
      this.content = this.element.innerHTML;
      this.onTransaction();
    });
  }

  getContent() {
    return this.element.innerHTML;
  }

  setContent(html) {
    this.content = html;
    this.element.innerHTML = html;
  }

  clearContent() {
    this.content = "";
    this.element.innerHTML = "";
  }

  destroy() {
    this.element.removeEventListener("input", this.onTransaction);
  }
};
core.Bold = {
  name: "bold",
  apply(editor) {
    document.execCommand("bold");
  },
};

core.Italic = {
  name: "italic",
  apply(editor) {
    document.execCommand("italic");
  },
};

core.Underline = {
  name: "underline",
  apply(editor) {
    document.execCommand("underline");
  },
};

core.Paragraph = {
  name: "paragraph",
  apply(editor) {
    document.execCommand("formatBlock", false, "p");
  },
};

core.Heading = (level = 2) => ({
  name: `heading-${level}`,
  apply(editor) {
    document.execCommand("formatBlock", false, `h${level}`);
  },
});

core.TextAlign = (align = "left") => ({
  name: `textAlign-${align}`,
  apply(editor) {
    document.execCommand("justify" + align.charAt(0).toUpperCase() + align.slice(1));
  },
});

core.Link = {
  name: "link",
  apply(editor, url) {
    document.execCommand("createLink", false, url);
  },
};

core.Unlink = {
  name: "unlink",
  apply(editor) {
    document.execCommand("unlink", false, null);
  },
};
window["@tiptap/vanilla-bundle"].Editor
return core;
}));
