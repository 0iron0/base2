
_registerElement("audio", {
  detect: "play",
  
  display: "none",
  
  extraStyles: {
    "audio[controls]": {
      display: "inline"
    }
  },
  
  methods: "load,play,pause",

  behavior:    null // TO DO: add a behavior to support the audio element (flash/bgsound?)
});
