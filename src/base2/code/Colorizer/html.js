
with (base2) code.Colorizer.addScheme("html", {
  conditional: /<!(--)?\[[^\]]*\]>|<!\[endif\](--)?>/, // conditional comments
  doctype:     /<!DOCTYPE[^>]+>/,
  inline:      /<(script|style)([^>]*)>((\\.|[^\\])*)<\/\1>/
}, {
  inline: function(match, tagName, attributes, cdata) {
    return format(this.INLINE, tagName, this.exec(attributes, true), cdata);
  }
}, {
  INLINE: '&lt;<span class="tag">%1</span>%2&gt;%3&lt;/<span class="tag">%1</span>&gt;',
  tabStop: 1
});

with (base2.code.Colorizer) html.merge(xml);
