
eval(base2.namespace);
eval(DOM.namespace);
eval(JSB.namespace);

var ATTRIBUTE = /(\w+)=([^"'\s]+)/g;
var QUOTE = '<blockquote cite="#%1">\n%3\n<address>' +
	'<a href="#%1" rel="bookmark">%2</a></address>\n</blockquote>';
var TIDY = new RegGrp({
	"(<\\/?)(\\w+)([^>]*)": function($, lt, tagName, attributes) {
		return lt + tagName.toLowerCase() + attributes.replace(ATTRIBUTE, function($, attribute, value) {
			return attribute.toLowerCase() + '"' + value + '"';
		});
	},
	"&nbsp;": " "
});

Colorizer.javascript.store("\\b(assignID|base|base2|base2ID|every|extend|filter|forEach|" +
	"format|implement|instanceOf|invoke|K|map|pluck|reduce|rescape|slice|some|trim)\\b",
		'<span class="base2">$0</span>');

function updateFlag() {
	// update the "required" flag adjacent to an <input> or <textrea>
	this.nextSibling.style.color = this.value ? "#898E79" : "#A03333";
};

new RuleList({
	"pre": {
		ondocumentready: function() {
			var names = this.className.split(/\s+/);
			for (var i = 0; i < names.length; i++) {
				// use the first class name that matches a highlighter
				var engine = names[i];
				var colorizer = Colorizer[engine];
				if (instanceOf(colorizer, Colorizer)) {
					var textContent = Traversal.getTextContent(this);
					this.setAttribute("originalText", textContent);
					this.innerHTML = colorizer.exec(textContent);
					this.addClass("highlight");
					if (engine == "html-multi") this.addClass("html");
					break;
				}
			}
		}
	},
	
	"input.required,textarea.required": {
		ondocumentready: updateFlag,		
		ondocumentmouseup: updateFlag,		
		ondocumentkeyup: updateFlag
	},
	
	"li.comment:not(.disabled)": {
		ondocumentready: function() {
			// create the <button> element
			var comment = this;
			var button = document.createElement("button");
			Traversal.setTextContent(button, "Quote");
			comment.appendChild(button);
			button.onclick = function() {
				var textarea = document.matchSingle("textarea");
				var id = comment.id;
				var cite = comment.matchSingle("cite:last-child");
				var author = Traversal.getTextContent(cite) || "comment #" + id;
				// tidy the WordPress formatted text
				author = author.replace(/(^\s*comment(\s+by)?\s)|(\s\W\s.*$)/gi, "");
				// grab text text selection (if any)
				var selectedText = "";
				if (window.getSelection) {
					selectedText = String(window.getSelection());
				} else if (document.selection) {
					selectedText = document.selection.createRange().text;
				}
				if (selectedText) {
					// use the selected text
					var quote = "<p>" + trim(selectedText) + "</p>";
				} else {
					// grab the entire comment's html
					var text = comment.matchSingle("div.comment-text").cloneNode(true);
					// strip syntax-highlighting
					forEach (Element.matchAll(text, "pre"), function(pre) {
						Traversal.setTextContent(pre, pre.getAttribute("originalText"));
						pre.removeAttribute("originalText");
						pre.removeAttribute("style");
						pre.removeAttribute("base2ID");
					});
					// remove smilies
					forEach (Element.matchAll(text, "img"), function(img) {
						img.parentNode.replaceChild(document.createTextNode(img.alt), img);
					});
					// tidy the html
					quote = trim(TIDY.exec(text.innerHTML));
				}
				// create <blockquote> html
				var html = format(QUOTE, id, author, quote);
				// update the comment form
				textarea.value = trim(textarea.value + "\n" + html);
				textarea.focus();
			};
		},
		
		onmouseover: function() {
			this.matchSingle("button").style.visibility = "visible";
		},
		
		onmouseout: function() {
			this.matchSingle("button").style.visibility = "";
		}
	}
});
