function $(id) {
  var res=document.getElementById(id);
  if(res==null) console.log("Element with id '%s' is not found",id);
  return res;
}
function htmlEncode(s) {
  return String(s).replace(/(&|<|>|")/g,function($,ch) {
    switch(ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default : /*should never happen*/ return ch; 
    }
  });
}
//Don't know how to inherit from Error, so use as:
//  throw newError("Error number %1.",1)
function newError(msg/*, format1, ..., format9*/) {
  return new Error(format.apply(null,arguments));
}
function padRight(str,n,ch) { return (str+new Array(n+1).join(ch||" ")).slice(0,n); }
function padLeft(str,n,ch) { return (new Array(n+1).join(ch||" ")+str).slice(-n); }
function toDutchDate(dt,format,bRelative,bCapital,sFirstWord)
//--#Converteerd een datum-type naar een nederlandse datumstring
//--@format;type=string@date,datetime,datetimeS,time,timeS
//--@bRelative;type=boolean;optional;default=false@Use vandaag,gisteren,morgen
//--@bCapital;type=boolean;optional;default=false@Of het eerste teken een hoofdletter moet zijn.
//--@sFirstWord;type=string;optional@Het woord waar de datum mee begint (ivm bCapital)
{
  var date=fix(dt.getDate())+'-'+fix(dt.getMonth()+1)+'-'+dt.getFullYear();
  var time=dt.getHours()+':'+fix(dt.getMinutes());
  var seconds=':'+fix(dt.getSeconds());
  if(bRelative) {
    var nDaysFromNow=Date_valueInDays(dt) - Date_valueInDays(new Date());
    var objRelative={'-1':'gisteren','0':'vandaag','1':'morgen'};
    if(objRelative[nDaysFromNow]) {
      date=objRelative[nDaysFromNow];
      time='om '+time;
    }
    else {
      if(sFirstWord) {
        date=sFirstWord+' '+date;
      }
      time='om '+time;
    }
    if(bCapital) {
      date=date.substr(0,1).toUpperCase()+date.substr(1);
    }
  }
  else {
    if(time.length==4) time="0"+time;
  }
  switch(format) {
    case 'datetime': return date+' '+time;
    case 'datetimeS': return date+' '+time+seconds;
    case 'date': return date;
    case 'time': return time;
    case 'timeS': return time+seconds;
    default: return dt.toString();
  }
}
function Date_valueInDays(dt)
//--#Results in #days since 1970; handy to compares dates without time
{	
	return parseInt( new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() ).valueOf() / (24*60*60*1000), 10);
}

function fix(n)
{
  if((''+n).length==1) return '0'+n;
  else return ''+n;
}
function parseDate(s) {
  var iso=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})\d+Z$/;
  var a=iso.exec(s);
  if(a) return new Date(a[1],a[2],a[3],/*T*/a[4],a[5],a[6],a[7]);
  return new Date(s);
}
/*
if(console===undefined) {
  //IE, non-firebug Firefox
  var console={log:[]}
  console.log=function(s) { 
    if(console.log.length==0&&window.attachEvent) {
      top.defaultStatus+=" [press Ctrl+\\ for logging]";
    }
    console.log.push(s); 
  }
  if(window.attachEvent) { //IE
    window.attachEvent("onload",function() {
      document.body.attachEvent('onkeypress',function() {
        if(event.keyCode==28) { //control-backslash
          if(confirm(console.log.join("\n")+"\n\nEmpy log?"))
            console.log=[];
        }
      });
    });
  }
}
*/