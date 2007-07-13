
Selector.operators = {
	"=":  "%1=='%2'",
	"!=": "%1!='%2'", //  not standard but other libraries support it
	"~=": /(^| )%1( |$)/,
	"|=": /^%1(-|$)/,
	"^=": /^%1/,
	"$=": /%1$/,
	"*=": /%1/
};

Selector.operators[""] = "%1!=null";
