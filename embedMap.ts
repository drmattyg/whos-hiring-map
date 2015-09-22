/// <reference path='typings/leaflet/leaflet.d.ts' />
import WHP = require('./WHParser')
var entryData: WHP.WHEntry[] = window["entryData"];
var map: L.Map = new L.Map("wh-map");
var osmUrl: string ='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib: string ='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm: L.TileLayer = new L.TileLayer(osmUrl, {minZoom: 1, maxZoom: 12, attribution: osmAttrib});
map.setView(new L.LatLng(47, -34), 3);
map.addLayer(osm);
entryData.forEach((e: WHP.WHEntry) => {
	var latLon: number[] = [e.geolocation.latitude, e.geolocation.longitude];
	var marker: L.Marker = L.marker(latLon).addTo(map);
	marker.bindPopup('<font size="1"><b>' + e.header + '</b><p>' + e.html + '</p></font>');
});
