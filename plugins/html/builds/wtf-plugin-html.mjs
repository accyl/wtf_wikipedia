/* wtf-plugin-html 0.2.2  MIT */
const defaults$4 = {
  title: true,
  infoboxes: true,
  headers: true,
  sections: true,
  links: true
}; //we should try to make this look like the wikipedia does, i guess.

const softRedirect = function (doc) {
  let link = doc.redirectTo();
  let href = link.page;
  href = './' + href.replace(/ /g, '_');

  if (link.anchor) {
    href += '#' + link.anchor;
  }

  return `  <div class="redirect">
  ↳ <a class="link" href="./${href}">${link.text}</a>
  </div>`;
}; //turn a Doc object into a HTML string


const toHtml$5 = function (options) {
  options = Object.assign({}, defaults$4, options);
  let html = ''; //add page title

  if (options.title === true && this._title) {
    html += '<title>' + this._title + '</title>\n';
  } //if it's a redirect page, give it a 'soft landing':


  if (this.isRedirect() === true) {
    html += softRedirect(this);
    return html;
  } //render infoboxes (up at the top)


  if (options.infoboxes === true) {
    html += this.infoboxes().map(i => i.html(options)).join('\n');
  } //render each section


  if (options.sections === true || options.paragraphs === true || options.sentences === true) {
    html += this.sections().map(s => s.html(options)).join('\n');
  } //default off


  if (options.references === true) {
    html += '<h2>References</h2>';
    html += this.references().map(c => c.html(options)).join('\n');
  }

  return html;
};

var _01Doc = toHtml$5;

const defaults$3 = {
  headers: true,
  images: true,
  tables: true,
  lists: true,
  paragraphs: true
};

const doSection = function (options) {
  options = Object.assign({}, defaults$3, options);
  let html = ''; //make the header

  if (options.headers === true && this.title()) {
    let num = 1 + this.depth();
    html += '  <h' + num + '>' + this.title() + '</h' + num + '>';
    html += '\n';
  } //put any images under the header


  if (options.images === true) {
    let imgs = this.images();

    if (imgs.length > 0) {
      html += imgs.map(image => image.html(options)).join('\n');
    }
  } //make a html table


  if (options.tables === true) {
    html += this.tables().map(t => t.html(options)).join('\n');
  } //make a html bullet-list


  if (options.lists === true) {
    html += this.lists().map(list => list.html(options)).join('\n');
  } //finally, write the sentence text.


  if (options.paragraphs === true && this.paragraphs().length > 0) {
    html += '  <div class="text">\n';
    this.paragraphs().forEach(p => {
      html += '    <p class="paragraph">\n';
      html += '      ' + p.sentences().map(s => s.html(options)).join(' ');
      html += '\n    </p>\n';
    });
    html += '  </div>\n';
  } else if (options.sentences === true) {
    html += '      ' + this.sentences().map(s => s.html(options)).join(' ');
  }

  return '<div class="section">\n' + html + '</div>\n';
};

var _02Section = doSection;

const defaults$2 = {
  sentences: true
};

const toHtml$4 = function (options) {
  options = Object.assign({}, defaults$2, options);
  let html = '';

  if (options.sentences === true) {
    html += this.sentences().map(s => s.html(options)).join('\n');
  }

  return html;
};

var _03Paragraph = toHtml$4;

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
}; // create links, bold, italic in html

const doSentence = function (options) {
  options = Object.assign({}, defaults$1, options);
  let text = this.text(); //turn links into <a href>

  if (options.links === true) {
    this.links().forEach(link => {
      let str = link.text() || link.page();
      let tag = link.html();
      text = smartReplace_1(text, str, tag);
    });
  }

  if (options.formatting === true) {
    //support bolds
    this.bolds().forEach(str => {
      let tag = '<b>' + str + '</b>';
      text = smartReplace_1(text, str, tag);
    }); //do italics

    this.italics().forEach(str => {
      let tag = '<i>' + str + '</i>';
      text = smartReplace_1(text, str, tag);
    });
  }

  return '<span class="sentence">' + text + '</span>';
};

var _04Sentence = doSentence;

const toHtml$3 = function () {
  let classNames = 'link';
  let href = this.href();
  href = href.replace(/ /g, '_');
  let str = this.text() || this.page();
  return `<a class="${classNames}" href="${href}">${str}</a>`;
};

var _05Link = toHtml$3;

const defaults = {
  images: true
};
const dontDo = {
  image: true,
  caption: true,
  alt: true,
  signature: true,
  'signature alt': true
}; //

const infobox = function (options) {
  options = Object.assign({}, defaults, options);
  let html = '<table class="infobox">\n';
  html += '  <thead>\n';
  html += '  </thead>\n';
  html += '  <tbody>\n'; //put image and caption on the top

  if (options.images === true && this.data.image) {
    html += '    <tr>\n';
    html += '       <td colspan="2" style="text-align:center">\n';
    html += '       ' + this.image().html() + '\n';
    html += '       </td>\n';

    if (this.data.caption || this.data.alt) {
      let caption = this.data.caption ? this.data.caption.html(options) : this.data.alt.html(options);
      html += '       <td colspan="2" style="text-align:center">\n';
      html += '         ' + caption + '\n';
      html += '       </td>\n';
    }

    html += '    </tr>\n';
  }

  Object.keys(this.data).forEach(k => {
    if (dontDo[k] === true) {
      return;
    }

    let s = this.data[k];
    let key = k.replace(/_/g, ' ');
    key = key.charAt(0).toUpperCase() + key.substring(1); //titlecase it

    let val = s.html(options);
    html += '    <tr>\n';
    html += '      <td>' + key + '</td>\n';
    html += '      <td>' + val + '</td>\n';
    html += '    </tr>\n';
  });
  html += '  </tbody>\n';
  html += '</table>\n';
  return html;
};

var infobox_1 = infobox;

const makeImage = function () {
  return '  <img src="' + this.thumbnail() + '" alt="' + this.alt() + '"/>';
};

var image = makeImage;

//
const toHtml$2 = function (options) {
  let html = '  <ul class="list">\n';
  this.lines().forEach(s => {
    html += '    <li>' + s.html(options) + '</li>\n';
  });
  html += '  </ul>\n';
  return html;
};

var list = toHtml$2;

//
const toHtml$1 = function (options) {
  if (this.data && this.data.url && this.data.title) {
    let str = this.data.title;

    if (options.links === true) {
      str = `<a href="${this.data.url}">${str}</a>`;
    }

    return `<div class="reference">⌃ ${str} </div>`;
  }

  if (this.data.encyclopedia) {
    return `<div class="reference">⌃ ${this.data.encyclopedia}</div>`;
  }

  if (this.data.title) {
    //cite book, etc
    let str = this.data.title;

    if (this.data.author) {
      str += this.data.author;
    }

    if (this.data.first && this.data.last) {
      str += this.data.first + ' ' + this.data.last;
    }

    return `<div class="reference">⌃ ${str}</div>`;
  }

  if (this.inline) {
    return `<div class="reference">⌃ ${this.inline.html()}</div>`;
  }

  return '';
};

var reference = toHtml$1;

//turn a json table into a html table
const toHtml = function (options) {
  let rows = this.data;
  let html = '<table class="table">\n'; //make header

  html += '  <thead>\n';
  html += '  <tr>\n';
  Object.keys(rows[0]).forEach(k => {
    if (/^col[0-9]/.test(k) !== true) {
      html += '    <td>' + k + '</td>\n';
    }
  });
  html += '  </tr>\n';
  html += '  </thead>\n';
  html += '  <tbody>\n'; //make rows

  rows.forEach(o => {
    html += '  <tr>\n';
    Object.keys(o).forEach(k => {
      let val = o[k].html(options);
      html += '    <td>' + val + '</td>\n';
    });
    html += '  </tr>\n';
  });
  html += '  </tbody>\n';
  html += '</table>\n';
  return html;
};

var table = toHtml;

const plugin = function (models) {
  models.Doc.prototype.html = _01Doc;
  models.Section.prototype.html = _02Section;
  models.Paragraph.prototype.html = _03Paragraph;
  models.Sentence.prototype.html = _04Sentence;
  models.Image.prototype.html = image;
  models.Infobox.prototype.html = infobox_1;
  models.Link.prototype.html = _05Link;
  models.List.prototype.html = list;
  models.Reference.prototype.html = reference;
  models.Table.prototype.html = table; // models.Template.html = function(opts) {}
};

var src = plugin;

export default src;
