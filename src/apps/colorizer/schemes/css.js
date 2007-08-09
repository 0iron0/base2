
Colorizer.css = new Colorizer({
  at_rule:   /@[\w\s]+/,
  bracketed: /\([^'\x22)]*\)/,
  comment:   Colorizer.patterns.block_comment,
  property:  /(\w[\w-]*\s*):([^;}]+)/,
  special:   /(\-[\w-]*\s*):/,
  selector:  /([\w-:\[.#][^{};]*)\{/
}, {
  bracketed: IGNORE,
  selector:  "@1{",
  special:   "@1:",
  property:  '@1:<span class="property value">$2</span>'
});
