require("./IBMPlexMono-Light.ttf");
require("./IBMPlexMono-Medium.ttf");

const logo = require("./moonad_logo.png").default;

const {Component, render} = require("inferno");
const h = require("inferno-hyperscript").h;

const front = require("./front.js");
const Moonad = require("./components/Moonad.js");

window.onload = () => render(h(Moonad), document.getElementById("main"));

const version = "2";
if (localStorage.getItem("version") !== version) {
  const pkey = localStorage.getItem("pkey");
  localStorage.clear();
  localStorage.setItem("version", version);
  localStorage.setItem("pkey", pkey);
}
