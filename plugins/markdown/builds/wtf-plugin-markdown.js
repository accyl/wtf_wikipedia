/* wtf-plugin-markdown 0.2.1  MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.wtfPerson = factory());
}(this, (function () { 'use strict';

  const defaults$4 = {
    redirects: true,
    infoboxes: true,
    templates: true,
    sections: true
  }; //we should try to make this look like the wikipedia does, i guess.

  const softRedirect = function (doc) {
    let link = doc.redirectTo();
    let href = link.page;
    href = './' + href.replace(/ /g, '_');

    if (link.anchor) {
      href += '#' + link.anchor;
    }

    return `↳ [${link.text}](${href})`;
  }; //turn a Doc object into a markdown string


  const toMarkdown$6 = function (options) {
    options = Object.assign({}, defaults$4, options);
    let data = this;
    let md = ''; //if it's a redirect page, give it a 'soft landing':

    if (options.redirects === true && this.isRedirect() === true) {
      return softRedirect(this); //end it here
    } //render infoboxes (up at the top)


    if (options.infoboxes === true && options.templates === true) {
      md += this.infoboxes().map(infobox => infobox.markdown(options)).join('\n\n');
    } //render each section


    if (options.sections === true || options.paragraphs === true || options.sentences === true) {
      md += data.sections().map(s => s.markdown(options)).join('\n\n');
    } //default false


    if (options.references === true) {
      md += '## References';
      md += this.citations().map(c => c.json(options)).join('\n');
    }

    return md;
  };

  var _01Doc = toMarkdown$6;

  const defaults$3 = {
    headers: true,
    images: true,
    tables: true,
    lists: true,
    paragraphs: true
  };

  const doSection = function (options) {
    options = Object.assign({}, defaults$3, options);
    let md = ''; //make the header

    if (options.headers === true && this.title()) {
      let header = '##';

      for (let i = 0; i < this.depth(); i += 1) {
        header += '#';
      }

      md += header + ' ' + this.title() + '\n';
    } //put any images under the header


    if (options.images === true) {
      let images = this.images();

      if (images.length > 0) {
        md += images.map(img => img.markdown()).join('\n');
        md += '\n';
      }
    } //make a markdown table


    if (options.tables === true) {
      let tables = this.tables();

      if (tables.length > 0) {
        md += '\n';
        md += tables.map(table => table.markdown(options)).join('\n');
        md += '\n';
      }
    } //make a markdown bullet-list


    if (options.lists === true) {
      let lists = this.lists();

      if (lists.length > 0) {
        md += lists.map(list => list.markdown(options)).join('\n');
        md += '\n';
      }
    } //finally, write the sentence text.


    if (options.paragraphs === true || options.sentences === true) {
      md += this.paragraphs().map(p => {
        return p.sentences().map(s => s.markdown(options)).join(' ');
      }).join('\n\n');
    }

    return md;
  };

  var _02Section = doSection;

  const defaults$2 = {
    sentences: true
  };

  const toMarkdown$5 = function (options) {
    options = Object.assign({}, defaults$2, options);
    let md = '';

    if (options.sentences === true) {
      md += this.sentences().reduce((str, s) => {
        str += s.markdown(options) + '\n';
        return str;
      }, {});
    }

    return md;
  };

  var _03Paragraph = toMarkdown$5;

  //escape a string like 'fun*2.Co' for a regExpr
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  } //sometimes text-replacements can be ambiguous - words used multiple times..


  const smartReplace = function (all, text, result) {
    if (!text || !all) {
      return all;
    }

    if (typeof all === 'number') {
      all = String(all);
    }

    text = escapeRegExp(text); //try a word-boundary replace

    let reg = new RegExp('\\b' + text + '\\b');

    if (reg.test(all) === true) {
      all = all.replace(reg, result);
    } else {
      //otherwise, fall-back to a much messier, dangerous replacement
      // console.warn('missing \'' + text + '\'');
      all = all.replace(text, result);
    }

    return all;
  };

  var smartReplace_1 = smartReplace;

  const defaults$1 = {
    links: true,
    formatting: true
  }; //create links, bold, italic in markdown

  const toMarkdown$4 = function (options) {
    options = Object.assign({}, defaults$1, options);
    let md = this.text(); //turn links back into links

    if (options.links === true) {
      this.links().forEach(link => {
        let mdLink = link.markdown();
        let str = link.text() || link.page();
        md = smartReplace_1(md, str, mdLink);
      });
    } //turn bolds into **bold**


    if (options.formatting === true) {
      this.bolds().forEach(b => {
        md = smartReplace_1(md, b, '**' + b + '**');
      }); //support *italics*

      this.italics().forEach(i => {
        md = smartReplace_1(md, i, '*' + i + '*');
      });
    }

    return md;
  };

  var _04Sentence = toMarkdown$4;

  // add `[text](href)` to the text
  const toMarkdown$3 = function () {
    let href = this.href();
    href = href.replace(/ /g, '_'); // href = encodeURIComponent(href)

    let str = this.text() || this.page();
    return '[' + str + '](' + href + ')';
  };

  var _05Link = toMarkdown$3;

  //markdown images are like this: ![alt text](href)
  const toMarkdown$2 = function () {
    let alt = this.data.file.replace(/^(file|image):/i, '');
    alt = alt.replace(/\.(jpg|jpeg|png|gif|svg)/i, '');
    return '![' + alt + '](' + this.thumbnail() + ')';
  };

  var image = toMarkdown$2;

  //center-pad each cell, to make the table more legible
  const pad = (str, cellWidth) => {
    str = str || '';
    str = String(str);
    cellWidth = cellWidth || 15;
    let diff = cellWidth - str.length;
    diff = Math.ceil(diff / 2);

    for (let i = 0; i < diff; i += 1) {
      str = ' ' + str;

      if (str.length < cellWidth) {
        str = str + ' ';
      }
    }

    return str;
  };

  var pad_1 = pad;

  const dontDo = {
    image: true,
    caption: true,
    alt: true,
    signature: true,
    'signature alt': true
  };
  const defaults = {
    images: true
  }; //
  // render an infobox as a table with two columns, key + value

  const doInfobox = function (options) {
    options = Object.assign({}, defaults, options);
    let md = '|' + pad_1('', 35) + '|' + pad_1('', 30) + '|\n';
    md += '|' + pad_1('---', 35) + '|' + pad_1('---', 30) + '|\n'; //todo: render top image here (somehow)

    Object.keys(this.data).forEach(k => {
      if (dontDo[k] === true) {
        return;
      }

      let key = '**' + k + '**';
      let s = this.data[k];
      let val = s.markdown(options); //markdown is more newline-sensitive than wiki

      val = val.split(/\n/g).join(', ');
      md += '|' + pad_1(key, 35) + '|' + pad_1(val, 30) + ' |\n';
    });
    return md;
  };

  var infobox = doInfobox;

  //
  const toMarkdown$1 = function (options) {
    return this.lines().map(s => {
      let str = s.markdown(options);
      return ' * ' + str;
    }).join('\n');
  };

  var list = toMarkdown$1;

  //
  const toMarkdown = function () {
    if (this.data && this.data.url && this.data.title) {
      return `⌃ [${this.data.title}](${this.data.url})`;
    } else if (this.data.encyclopedia) {
      return `⌃ ${this.data.encyclopedia}`;
    } else if (this.data.title) {
      //cite book, etc
      let str = this.data.title;

      if (this.data.author) {
        str += this.data.author;
      }

      if (this.data.first && this.data.last) {
        str += this.data.first + ' ' + this.data.last;
      }

      return `⌃ ${str}`;
    } else if (this.inline) {
      return `⌃ ${this.inline.markdown()}`;
    }

    return '';
  };

  var reference = toMarkdown;

  /* this is a markdown table:
  | Tables        | Are           | Cool  |
  | ------------- |:-------------:| -----:|
  | col 3 is      | right-aligned | $1600 |
  | col 2 is      | centered      |   $12 |
  | zebra stripes | are neat      |    $1 |
  */

  const makeRow = arr => {
    arr = arr.map(s => pad_1(s, 14));
    return '| ' + arr.join(' | ') + ' |';
  }; //markdown tables are weird


  const doTable = function (options) {
    let md = '';

    if (!this || this.length === 0) {
      return md;
    }

    let rows = this.data;
    let keys = Object.keys(rows[0]); //first, grab the headers
    //remove auto-generated number keys

    let headers = keys.map(k => {
      if (/^col[0-9]/.test(k) === true) {
        return '';
      }

      return k;
    }); //draw the header (necessary!)

    md += makeRow(headers) + '\n';
    md += makeRow(headers.map(() => '---')) + '\n'; //do each row..

    md += rows.map(row => {
      //each column..
      let arr = keys.map(k => {
        if (!row[k]) {
          return '';
        }

        return row[k].markdown(options) || '';
      }); //make it a nice padded row

      return makeRow(arr);
    }).join('\n');
    return md + '\n';
  };

  var table = doTable;

  const plugin = function (models) {
    models.Doc.prototype.markdown = _01Doc;
    models.Section.prototype.markdown = _02Section;
    models.Paragraph.prototype.markdown = _03Paragraph;
    models.Sentence.prototype.markdown = _04Sentence;
    models.Link.prototype.markdown = _05Link;
    models.Image.prototype.markdown = image;
    models.Infobox.prototype.markdown = infobox;
    models.Table.prototype.markdown = table;
    models.List.prototype.markdown = list;
    models.Reference.prototype.markdown = reference;
  };

  var src = plugin;

  return src;

})));
//# sourceMappingURL=wtf-plugin-markdown.js.map
