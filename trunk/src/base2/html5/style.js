
var style = {
  "audio,datalist,details:not([open])>:not(legend),eventsource,[repeat=template],.html5-template": {
    display: "none"
  },
  "audio[controls]": {
    display: "inline"
  },
  "article,aside,datagrid,details,dialog,figure,footer,header,menu,nav,section,video": {
    display: "block",
    margin:  "1em 0",
  },
  "details legend": {
    display: "block"
  },
  figure: {
    margin: "1em 40px"
  },
  mark: {
    background: "yellow",
    color: "black"
  },
  menu: {
    paddingLeft: "40px",
    listStyleType: "disc"
  },
  "dir menu,dl menu,menu dir, menu dl, menu menu, menu ol, menu ul,ol menu,ul menu": {
    margin:  0,
    listStyleType: "circle"
  },
  "meter,progress": {
    display: "inline-block"
  },
  meter: {
    backgroundColor: "ThreeDFace",
    color: "Highlight",
    borderLeft: "0px solid",
    height: "1.5em",
    paddingLeft: "2px",
    fontSize: "0.67em",
    width: "10em",
    overflow: "hidden",
    $textOverflow: "ellipsis",
    $boxSizing: "border-box"
  }
};

/*
where x = "article,aside,nav,section"
x h1 { font-size: 1.50em; }
x x h1 { font-size: 1.17em; }
x x x h1 { font-size: 1.00em; }
x x x x h1 { font-size: 0.83em; }
x x x x x h1 { font-size: 0.67em; }
*/