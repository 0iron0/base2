
var locales = {
  en: {
    days: "S,M,T,W,T,F,S",
    months: "January,February,March,April,May,June,July,August,September,October,November,December",
    firstDay: 1 // Sunday = 0, Monday = 1, etc
  },
  
  de: {
		days: "S,M,D,M,D,F,S",
		months: "Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember"
  },
  
  es: {
		days: "D,L,M,Mi,J,V,S",
    months: "Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre",
		firstDay: 0
  },
  
  fr: {
    days: "D,L,M,M,J,V,S",
    months: "Janvier,Février,Mars,Avril,Mai,Juin,Juillet,Août,Septembre,Octobre,Novembre,Décembre"
  },
  
  it: {
		days: "D,L,M,M,G,V,S",
		months: "Gennaio,Febbraio,Marzo,Aprile,Maggio,Giugno,Luglio,Agosto,Settembre,Ottobre,Novembre,Dicembre"
  },
  
  nl: {
		days: "zo,ma,di,wo,do,vr,za",
		months: "januari,februari,maart,april,mei,juni,juli,augustus,september,oktober,november,december"
  },
  
  ru: {
		days: "Вс,Пн,Вт,Ср,Чт,Пт,Сб",
		months: "Январь,Февраль,Март,Апрель,Май,Июнь,Июль,Август,Сентябрь,Октябрь,Ноябрь,Декабрь"
  }
};

var Locale = Base.extend({
  constructor: function(lang) {
    this.lang = lang.slice(0, 2);
    extend(this, locales[this.lang]);
    this.days = this.days.split(",");
    for (var i = 0; i < this.firstDay; i++) this.days.push(this.days.shift());
    this.months = this.months.split(",");
  }
});
extend(Locale.prototype, locales.en);

chrome.locale = new Locale(navigator.language || navigator.systemLanguage);
