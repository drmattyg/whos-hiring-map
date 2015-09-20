/// <reference path='typings/leaflet/leaflet.d.ts' />

var map: L.Map = new L.Map("wh-map");
var osmUrl: string ='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib: string ='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm: L.TileLayer = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});
map.setView(new L.LatLng(51.3, 0.7),9);
map.addLayer(osm);
